---
title: Main Concepts and Terminology
menuOrder: 10
---

# Main Concepts and Terminology

**Obsidian Asset FS** abstracts the access to the assets (you do not need to
know how assets are stored, if they have already been downloaded or not,...).

* **Asset**: An asset can be an image, a sound, a 3D model,... It can be viewed
  as a "file".

* **Fragment**: A fragment is a file that groups one or more assets. It can be
  as a "chunk" of a file system.

* **Index**: The index is a JSON file that references all assets and fragments.
  The index file allow to know in which fragment is stored an asset and at
  which place (offset) exactly.
