---
title: API # make sure to match the name of the system in the config file
---

On top of defining a description for each system, you can also create a page for each system. This is useful if you want to add more information about the system, such as a link to the documentation, or a list of affected components.

This page is optional, but if you do not create one, the status page will not show the system in the summary.

**IMPORTANT:** If you create a page for a system, you must also create a corresponding entry in the `systems` list in the config file. Otherwise, the status page will not know which system to display.

For example, if you have a system called `API`, you can create a page called `api.md` in the `affected` folder. The content of the page will be shown in the summary.

