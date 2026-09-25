---
title: "Tearing the GPU node down from Proxmox to bare Debian"
description: "The GPU node ran Proxmox. I wiped it for bare Debian 13 so the GPU would sit directly under the host kernel, then spent the evening in the NVIDIA driver gauntlet Trixie hands you. The part that caught me was Secure Boot. (It has since gone back to Proxmox.)"
pubDate: 2026-06-18
updatedDate: 2026-09-23
home: false
lang: en
slug: gpu-debian-nvidia
tags: ["Homelab", "Debian", "NVIDIA", "Proxmox"]
---

<p>The GPU node in my homelab is a single-socket Xeon workstation that for a year ran Proxmox like the rest of the cluster. In June I wiped it and reinstalled bare Debian 13 (Trixie), because the one job I actually want from that box, running CUDA workloads against its GPU, is the one job a hypervisor makes harder. The reinstall took twenty minutes. Getting the driver to load took the rest of the evening, almost all of it on one step: Secure Boot silently refusing a module signed with a key it did not know.</p>

<p>The order of operations that actually works on Trixie is only a few steps, one of which is easy to miss.</p>

<p><em>Update, September 2026: the node has since rejoined the Proxmox cluster, where it runs the media services, the Kubernetes VM, and local LLM inference. The NVIDIA driver now lives on the Proxmox host itself, so there is still no VFIO passthrough involved. Proxmox VE 9 is built on Debian 13, so the steps below carry over to the host with one change: install the Proxmox kernel headers (<code>proxmox-default-headers</code>) instead of <code>linux-headers-amd64</code>.</em></p>

<h2>Why a hypervisor was the wrong layer here</h2>

<p>Proxmox earns its place when you are consolidating many guests onto one machine. GPU compute is the opposite case. To give a virtual machine a real GPU you go through VFIO passthrough, the mechanism that detaches a device from the host and hands it to a guest. That means sorting out IOMMU groups, the device blocks the hardware refuses to separate, keeping the host's drivers off the card, then handing the whole device to exactly one guest. You end up talking to your GPU through a virtual machine, the card can only ever belong to one VM at a time anyway, and you are carrying all of that machinery for a node that does precisely one thing.</p>

<p>A box that exists only to run one GPU does not need a hypervisor sitting between me and <code>nvidia-smi</code>. Remove the layer and the card is back on bare metal, with the passthrough tax gone along with it.</p>

<figure>
<div class="scroll" tabindex="0" role="region" aria-labelledby="fig-gpu-1">
<svg viewBox="0 0 720 340" role="img" aria-label="Two software stacks compared. The Proxmox stack has five layers with VFIO passthrough as friction; the bare Debian stack has four layers with the GPU directly under the kernel." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-u1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#111111"/>
    </marker>
  </defs>
  <text x="180" y="30" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="15" font-weight="700" fill="#111111">Before: Proxmox node</text>
  <text x="540" y="30" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="15" font-weight="700" fill="#111111">After: bare Debian 13</text>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111" text-anchor="middle">
    <rect x="60" y="54"  width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="79">CUDA workload (inside the guest)</text>
    <rect x="60" y="106" width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="131">VM: guest OS + NVIDIA driver</text>
    <rect x="60" y="158" width="240" height="40" rx="7" fill="#fbe7df" stroke="#5f5f5c" stroke-width="1.3"/>
    <text x="180" y="183" fill="#3d3d3d">VFIO passthrough</text>
    <rect x="60" y="210" width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="235">Proxmox host: kernel + KVM</text>
    <rect x="60" y="262" width="240" height="40" rx="7" fill="#e6e6e2" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="287">GPU</text>
  </g>
  <text x="180" y="322" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#3d3d3d">one VM owns the card · the driver lives in the guest</text>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111" text-anchor="middle">
    <rect x="420" y="80"  width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="540" y="105">CUDA workload</text>
    <rect x="420" y="132" width="240" height="40" rx="7" fill="#eeeeeb" stroke="#3d3d3d" stroke-width="1.3"/>
    <text x="540" y="157" fill="#111111">nvidia.ko (DKMS-built)</text>
    <rect x="420" y="184" width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="540" y="209">Debian 13 kernel</text>
    <rect x="420" y="236" width="240" height="40" rx="7" fill="#e6e6e2" stroke="#111111" stroke-width="1.3"/>
    <text x="540" y="261">GPU</text>
  </g>
  <text x="540" y="300" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#111111">the card answers to the kernel directly</text>
  <line x1="314" y1="162" x2="404" y2="162" stroke="#111111" stroke-width="3" marker-end="url(#ar-u1)"/>
  <text x="359" y="150" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="12" font-style="italic" fill="#5f5f5c">collapse the stack</text>
</svg>
</div>
<figcaption id="fig-gpu-1">The same hardware, two stacks. Passthrough buys flexibility a single-purpose GPU node never uses.</figcaption>
</figure>

<h2>Keeping nouveau off the card</h2>

<p>Debian ships <code>nouveau</code>, the open-source driver, and loads it at boot. The proprietary module will not bind while nouveau is holding the card. The <code>nvidia-driver</code> package installs its own blacklist for it, so the file below is only a safeguard; the step that matters is rebuilding the initramfs, so the blacklist is already in place in early boot, before nouveau can load from the initramfs and claim the GPU.</p>

<pre tabindex="0"><code># /etc/modprobe.d/blacklist-nouveau.conf
blacklist nouveau
options nouveau modeset=0

# then regenerate the initramfs so it sticks at boot
sudo update-initramfs -u</code></pre>

<h2>The driver itself: let DKMS do the building</h2>

<p>Trixie keeps the NVIDIA driver in the <code>non-free</code> component and its firmware in <code>non-free-firmware</code>, so the sources have to be widened before any of it is installable. Then you install the kernel headers and the driver package, and DKMS compiles the module against your running kernel. That is the reason to use the packaged driver instead of the <code>.run</code> installer: DKMS rebuilds the module on every kernel upgrade, so an <code>apt upgrade</code> does not quietly leave you with a black screen.</p>

<pre tabindex="0"><code># add  contrib non-free non-free-firmware  to your apt sources, then:
sudo apt update
sudo apt install linux-headers-amd64 nvidia-driver</code></pre>

<h2>Secure Boot: why nvidia-smi could not see the driver</h2>

<p>After the reboot I ran <code>nvidia-smi</code> and got this:</p>

<pre tabindex="0"><code>$ nvidia-smi
NVIDIA-SMI has failed because it couldn't communicate with the
NVIDIA driver. Make sure that the latest NVIDIA driver is installed
and running.</code></pre>

<p>The card was fine and the module had built without complaint. The kernel was simply refusing to load it, because Secure Boot was on and DKMS had signed the module with a local key the firmware did not trust yet. There are two ways out. You can turn Secure Boot off in firmware, or enroll that key as a Machine Owner Key and keep the chain of trust intact. I kept Secure Boot and enrolled the key, a one-time step in the MOK manager on the next boot. Nothing in the install itself fails loudly; you only find out at <code>nvidia-smi</code>.</p>

<pre tabindex="0"><code># enroll the DKMS signing key, set a one-time password, then reboot
sudo mokutil --import /var/lib/dkms/mok.pub
# at the blue MOK manager on reboot: Enroll MOK, enter the password, reboot</code></pre>

<p>After that, <code>nvidia-smi</code> came up clean with the card and driver version.</p>

<figure>
<div class="scroll" tabindex="0" role="region" aria-labelledby="fig-gpu-2">
<svg viewBox="0 0 720 560" role="img" aria-label="A vertical flowchart of the driver install: add sources, blacklist nouveau, install headers and driver via DKMS, then a Secure Boot decision that either enrolls a MOK or proceeds straight to reboot, ending at a working nvidia-smi." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-u2" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#111111"/>
    </marker>
  </defs>
  <g font-family="JetBrains Mono Variable,ui-monospace,monospace" font-size="12" fill="#111111" text-anchor="middle">
    <rect x="120" y="36" width="360" height="56" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="300" y="60">add contrib non-free non-free-firmware</text>
    <text x="300" y="78">to /etc/apt/sources.list</text>
    <rect x="120" y="110" width="360" height="48" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="300" y="139">blacklist nouveau, update-initramfs -u</text>
    <rect x="120" y="184" width="360" height="56" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="300" y="208">apt install linux-headers-amd64 nvidia-driver</text>
    <text x="300" y="226" fill="#5f5f5c">(DKMS builds against your kernel)</text>
  </g>
  <polygon points="300,258 382,300 300,342 218,300" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
  <text x="300" y="304" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111">Secure Boot on?</text>
  <rect x="475" y="274" width="206" height="52" rx="8" fill="#fbe7df" stroke="#b93a0a" stroke-width="1.4"/>
  <text x="578" y="296" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#9a3412">enroll the DKMS key (MOK)</text>
  <text x="578" y="313" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" font-style="italic" fill="#9a3412">the easy step to miss</text>
  <rect x="190" y="400" width="220" height="48" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
  <text x="300" y="429" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111">reboot</text>
  <rect x="120" y="476" width="360" height="48" rx="8" fill="#eeeeeb" stroke="#3d3d3d" stroke-width="1.4"/>
  <text x="300" y="505" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111">nvidia-smi shows the card + driver version</text>
  <g stroke="#111111" stroke-width="1.5" fill="none">
    <line x1="300" y1="92"  x2="300" y2="108" marker-end="url(#ar-u2)"/>
    <line x1="300" y1="158" x2="300" y2="182" marker-end="url(#ar-u2)"/>
    <line x1="300" y1="240" x2="300" y2="256" marker-end="url(#ar-u2)"/>
    <line x1="300" y1="342" x2="300" y2="398" marker-end="url(#ar-u2)"/>
    <line x1="382" y1="300" x2="473" y2="300" marker-end="url(#ar-u2)"/>
    <polyline points="578,326 578,372 300,372"/>
    <line x1="300" y1="448" x2="300" y2="474" marker-end="url(#ar-u2)"/>
  </g>
  <text x="284" y="362" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#5f5f5c">no</text>
  <text x="425" y="292" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#5f5f5c">yes</text>
</svg>
</div>
<figcaption id="fig-gpu-2">The whole sequence. Every box except the amber one is mechanical; the amber one is where a clean build still gives you a dead <code>nvidia-smi</code>.</figcaption>
</figure>

<h2>What I got back</h2>

<p><code>nvidia-smi</code> on bare metal, the full card with no virtual machine in the way, and a node that runs my CUDA and Kokkos builds straight against the hardware instead of through a guest. The rest of the cluster is still Proxmox: those nodes are doing the consolidation job Proxmox is good at. This node was not doing that job.</p>

<p>Keeping one bare-metal node beside a Proxmox cluster was awkward on the monitoring side: it had to be watched on its own, outside the tools that cover every other node. The node has since gone back to Proxmox (see the update at the top).</p>
