<p align="center"><img src="https://raw.githubusercontent.com/cstate/cstate/master/images/highlight.png" alt="cState"></p>

<p align="center"><a href="https://github.com/cstate/cstate/releases"><img src="https://img.shields.io/github/release/cstate/cstate/all.svg?style=flat-square" alt="GitHub release" /></a> <a href="https://github.com/cstate/cstate/commits/master"><img src="https://img.shields.io/github/last-commit/cstate/cstate.svg?style=flat-square" alt="GitHub last commit" /></a> <a href="https://github.com/cstate/cstate/tree/master/"><img src="https://img.shields.io/github/repo-size/cstate/cstate.svg?style=flat-square" alt="GitHub repo size in bytes" /></a> <a href="https://gitter.im/cState/Lobby"><img src="https://img.shields.io/badge/chat-gitter-ed1965.svg?style=flat-square" alt="Gitter" /></a> <a href="https://twitter.com/cstate"><img src="https://img.shields.io/twitter/follow/mistermantas.svg?style=social&amp;label=Follow" alt="Twitter" /></a> <a href="https://github.com/matiassingers/awesome-readme#readme"><img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome README" /></a></p>

> Über fast, backwards compatible (IE8+), tiny, and simple status page built with Hugo. Completely free with Netlify & GitHub Pages.

[**Want an example? Click here to see a live demo!**](https://cstate-example.netlify.com)

[You can also see what an example cState project’s source code.](https://github.com/cstate/example)

*Looking for contributors! See Contribute section:*

## Contents

+ [Features](#features)
+ Getting started
  + [Production](#production)
  + [Development](#development)
+ [Updating](#updating)
+ [FAQ](#faq)
+ [Contribute](#contribute)
+ [License](#license)

***

## Features

+ Built with [Hugo](https://gohugo.io), a hyperfast Golang generator
+ Works not just on mobile, but also on the archaic Internet Explorer 8
+ Comes with a simple, focused, and extremely light design
+ Edit your status page from a simple config file
+ Comes pre-equipped with Netlify CMS for quick admin updates
+ Easy to edit and deploy on Netlify or GitHub Pages
+ Secure, ready for HTTPS, thanks to [JAMstack](https://jamstack.org/)
+ Extensive documentation on the [wiki](https://github.com/cstate/cstate/wiki)

## Getting started

For this tutorial, it is assumed that you have Hugo and Git installed (check with `hugo version` & `git --version`).

#### Production

We encourage you to use [Netlify](https://www.netlify.com) for cState. These are the following options you need to change in deploy settings:

+ Build command: **hugo**
+ Publish directory: **public**
+ Add one build environment variable
  + Key: **HUGO_VERSION**
  + Value: **0.41**

***

1. Download the contents of the `exampleSite` directory in this repository. This will be your site guts, which will hold the content and configuration for the status page.
2. Create a `themes` folder and navigate to it on the command line.

```bash
mkdir themes; cd themes;
```

3. Now simply add a Git submodule pointing to this repository, like so:

```bash
git submodule add https://github.com/cstate/cstate
```

4. Set up cState for your liking. It is now ready to be used in production.

#### Development

1. Clone this repository in the command line:

```bash
git clone https://github.com/cstate/cstate.git
```

2. Go to the `exampleSite` folder, like so:

```bash
cd cstate-master/exampleSite
```

3. Uncomment this line in `config.yml`:

```yml
themesDir: ../..
```

4. Make sure that the folder name is the same as the `theme` value:d

```yml
theme: cstate-master
```

5. Then try out the site! A link to it will be shown on screen.

```bash
hugo serve
```

The main directory is the theme itself (the cState guts, basically) and the `exampleSite` folder houses all content. Use this local setup to experiment before deploying to production!

If you would like to commit/make a PR, make sure that `themesDir` is a comment before trying to merge upstream.

## Updating

Assuming the production install instructions were followed, keep cState updated by having an up to date Git submodule in the `themes` folder. containing this repository. Your content will stay separate, as to avoid any conflicts.

Do this from root:

```bash
git submodule foreach git pull origin master
```

More info on [Stack Overflow](https://stackoverflow.com/a/5828396).

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

*Monitoring* - After hitting the ole reboot button Example Chat App is now recovering. We’re going to continue to monitor as everyone reconnects. {{< track "2018-04-13 16:50:00" >}}

*Investigating* - We’re aware of users experiencing unavailable guilds and issues when attempting to connect. We're currently investigating. {{< track "2018-04-13 15:54:00" >}}
```

Time to break that down.

`Title`: This is the one of the most important parts of an incident. *(required)*  
`Date`: An ISO-8601 formatted date. Does not include time zone. This is when you first discovered the issue. *(required)*  
`Resolved`: Whether issue should affect overall status. Either `true` or `false`. *(boolean, required)*  
`ResolvedWhen`: An ISO-8601 formatted date. Does not include time zone. This is when downtime stopped. You may set the time that downtime ended without completely resolving the issue (thus leaving time for monitoring).  
`Severity`: If an issue is not resolved, it will have an applied severity. There are 3 levels of severity: `notice`, `disrupted`, and `down`. If there are multiple issues, the status page will take the appearance of the more drastic issue (such as `disrupted` instead of `notice`). *(required)*  
`Affected`. Add the items that were present in the config file which should alter the status of each individual system (component). *(array, required)*  
`Section`. This must be `issue`, so that Hugo treats it as one. *(required)*  

### I have more questions!

Check out [the wiki](https://github.com/cstate/cstate/wiki).

## Contribute

cState needs help to grow, not only would it benefit from stuff like unit tests, but also get influenced by fresh ideas to grow even further.

+ Glance over the [Code of Conduct](/CODE_OF_CONDUCT.md).
+ Before submitting a pull request, create an issue to [discuss the implications of your proposal](https://github.com/cstate/cstate/issues).
+ Write consistent, simple, readable code and precise documentation.
+ [Join the Gitter chat](http://discord.io/choraleapp) for help or discussion.
+ You may also the creator’s [mnts Discord](https://discord.gg/EvQZdhT).

## License

[MIT](https://github.com/cstate/cstate/blob/master/LICENSE.md) © Mantas Vilčinskas
