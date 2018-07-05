# cState

![Screnshot](https://raw.githubusercontent.com/mistermantas/cstate/master/images/screenshot.png)

[![GitHub release](https://img.shields.io/github/release/mistermantas/cstate.svg?style=flat-square)](https://github.com/mistermantas/cstate/releases) [![GitHub last commit](https://img.shields.io/github/last-commit/mistermantas/cstate.svg?style=flat-square)](https://github.com/mistermantas/cstate/commits/master) [![GitHub repo size in bytes](https://img.shields.io/github/repo-size/mistermantas/cstate.svg?style=flat-square)](https://github.com/mistermantas/cstate/tree/master/) [![Gitter](https://img.shields.io/badge/chat-gitter-ed1965.svg?style=flat-square)](https://gitter.im/cState/Lobby) [![Twitter](https://img.shields.io/twitter/follow/mistermantas.svg?style=social&label=Follow)](https://twitter.com/mistermantas)

> Über fast, backwards compatible (IE8+), tiny, and simple status page built with Hugo. Compatible with Netlify & GitHub Pages.

*This release is a developer preview.*

[**Live demo**](https://cstate.netlify.com)

## Contents

+ [Features](#features)
+ Getting started
  + [Production](#production)
  + [Development](#development)
  + [Updating](#updating)
+ [FAQ](#faq)
+ [Contribute](#contribute)
+ [License](#license)

## Features

+ Built with [Hugo](https://gohugo.io), a hyperfast Golang generator
+ Works not just on mobile, but also on the archaic Internet Explorer 8
+ Comes with a simple, focused, and extremely light design
+ Edit your status page from a simple config file
+ Comes pre-equipped with Netlify CMS for quick admin updates
+ Easy to edit and deploy on Netlify or GitHub Pages
+ Secure, ready for HTTPS, thanks to [JAMstack](https://jamstack.org/)

## Getting started

For this tutorial, it is assumed that you have Hugo and Git installed (check with `hugo version` & `git --version`).

#### Production (with Netlify)

We encourage you to use [Netlify](https://www.netlify.com) for cState. These are the following options you need to change in deploy settings:

+ Build command: **hugo**
+ Publish directory: **public**
+ Add one build environment variable
  + Key: **HUGO_VERSION**
  + Value: **0.31**

1. Download the contents of the `exampleSite` directory in this repository. This will be your site guts, which will hold the content and configuration for the status page.
2. Create a `themes` folder and navigate to it on the command line.

```bash
mkdir themes; cd themes;
```

3. Now simply add a Git submodule pointing to this repository, like so:

```bash
git submodule add https://github.com/mistermantas/cstate
```

4. Set up cState for your liking. It is now ready to be deployed

#### Development

1. Clone this repository in the command line:

```bash
git clone https://github.com/mistermantas/cstate.git
```

2. Go to the `exampleSite` folder, like so:

```bash
cd cstate-master/exampleSite
```

3. Uncomment this line in `config.yml`:

```yml
# themesDir: ../..
```

3. Then try out the site! A link to it will be shown on screen.

```bash
hugo serve
```

The main directory is the theme itself (the cState guts, basically) and the `exampleSite` folder houses all content. Use this local setup to experiment before deploying to production!

If you would like to commit/make a PR, make sure that `themesDir` is a comment before trying to merge upstream.

## Updating

Assuming the production install instructions were followed, keep cState updated by having an up to date Git submodule in the `themes` folder. containing this repository. Your content will stay separate, as to avoid any conflicts.

```bash
git submodule update
```

## FAQ

### Where do issues go? What is the frontmatter, how do I define metadata for issues?

Create a file in `content/issues`. The name of the file will be the slug (what shows up in the URL bar). For example, this is what `major-outage-east-us.md` should look like:

```md
---
Title: Major outage in East US
Date: 2017-02-30 14:30:00
Resolved: true
ResolvedWhen: 2017-02-30 16:00:00
Severity: down
Affected:
  - API
Section: post
---

*Monitoring* - After hitting the ole reboot button Example Chat App is now recovering. We're going to continue to monitor as everyone reconnects. {{< track "2018-04-13 16:50:00" >}}

*Investigating* - We're aware of users experiencing unavailable guilds and issues when attempting to connect. We're currently investigating. {{< track "2018-04-13 15:54:00" >}}
```

Time to break that down.

`Title`: This is the one of the most important parts of an incident. *(required)*  
`Date`: An ISO-8601 formatted date. Does not include time zone. This is when you first discovered the issue. *(required)*  
`Resolved`: Whether issue should affect overall status. Either `true` or `false`. *(boolean, required)*  
`ResolvedWhen`: An ISO-8601 formatted date. Does not include time zone. This is when downtime stopped. You may set the time that downtime ended without completely resolving the issue (thus leaving time for monitoring).  
`Severity`: If an issue is not resolved, it will have an applied severity. There are 3 levels of severity: `notice`, `disrupted`, and `down`. If there are multiple issues, the status page will take the appearance of the more drastic issue (such as `disrupted` instead of `notice`). *(required)*  
`Affected`. Add the items that were present in the config file which should alter the status of each individual system (component). *(array, required)*  
`Section`. This must be `issue`, so that Hugo treats it as one. *(required)*  

### Is there an admin panel or some easy way to change the state of each issue?

If you use [Netlify](https://www.netlify.com), you can expect to see Netlify CMS integration very soon. Otherwise, you could fall back to [prose.io](http://prose.io) or something similar.

### How do I make this work on GitHub Pages?

Compile locally (using production instructions), commit changes, and push them out. Using [Netlify](https://www.netlify.com) is recommended as it simplifies the process.

### My question was not answered!

This part of the documentation still needs to finished. [Questions](https://github.com/mistermantas/cstate/issues) are more than welcome and you should get a pretty fast response as well.

## Contribute

+ Glance over the [Code of Conduct](/CODE_OF_CONDUCT.md).
+ Before submitting a pull request, create an issue to [discuss the implications of your proposal](https://github.com/mistermantas/cstate/issues).
+ Write consistent, simple, readable code and precise documentation.
+ [Join the Gitter chat](http://discord.io/choraleapp) for help or discussion.

## License

[MIT](https://github.com/mistermantas/cstate/blob/master/LICENSE.md) © Mantas Vilčinskas
