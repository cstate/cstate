<p align="center"><img src="images/cstate-logo-bg.svg?sanitize=true" width="500" height="auto" alt="cState example illustration"></p>

> Über fast to load and build, backwards compatible (IE8+), tiny, and simple OSS status page built with Hugo. Completely _free_ with Netlify. Comes with Netlify CMS, read-only API, badges liek from shields.io, and other useful features.


<p>
<a href="https://github.com/cstate/cstate/releases"><img src="https://img.shields.io/github/release/cstate/cstate/all.svg?style=flat-square" alt="GitHub release" /></a>
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/cstate/cstate?label=Star%20Repo&style=social">
<a href="https://github.com/ivbeg/awesome-status-pages"><img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome status page" /></a></p>

**[VISIT THE CSTATE WEBSITE HERE](https://cstate.netlify.app)**

You can support the creator of this project by starring, sharing, using cState and/or [financially supporting the author](https://github.com/sponsors/mistermantas). Thank you!


## Examples 🥳

### Official

* [**Example site — cstate.mnts.lt**](https://cstate.mnts.lt)
* [Source code of the example cState site](https://github.com/cstate/example)
 
### More examples from the internet

* [Chocolatey](https://status.chocolatey.org/)
* [tmw.media](https://status.tmw.media)
* [Proventa](https://status.proventa.io/) (German)
* [sr.ht](https://status.sr.ht/)
* [Content Ignite](https://status.contentignite.com/)
* [FSCI](https://status.fsci.in/)
* [Hyrousek](https://status.hyrousek.tk)
* [josh.win](https://status.josh.win)

*Want your status page here? [Create a PR](https://github.com/cstate/cstate/edit/dev/README.md)!*

## Contents 🔍

+ [Sponsors](#sponsors-)
+ [Examples](#examples-)
+ [Features](#features-)
+ [Getting started](#getting-started-)
+ [Updating](#updating-)
+ [FAQ](#faq-)
+ [Contribute](#contribute-)
+ [License](#license-)


## Features 😎

Fast.

* Fast to load. Even on Internet Explorer 8. Incredible browser support. Minimal JS. No CSS dependencies either.
* Fast to create incidents. Use the command line or setup a CMS like Netlify CMS or Forestry for a no-code experience. See here
* Stays fast. Hugo & Golang can build a site with thousands of entries in seconds.

Nice.

* Focused, adaptable design. Auto dark mode. Easy customization from one file (or settings page). Statistical calculations show the key take-away (e.g., time spent fixing an issue).
* Fit for any language. With built-in support for English, German, French, Italian, Lithuanian, Macedonian, Dutch, Portuguese, Turkish, and Tagalog. See here
* All incidents, sorted. Link incidents to systems/categories, let users know how long previous downtime took, and more.

Free.

* Free hosting. Host on supported platforms like Netlify or manage cState yourself. See here
* Free your data. Use RSS or the read-only API to create custom HTML/JS integrations or simply embed the built-in badges/shields.
* Free for developers to expand upon. Integrate monitoring, link to other systems, change any text or style, create custom pages, and more.

**Please note that with all that cState _can_ do, it cannot do automatic monitoring out of the box. [See this thread](https://github.com/cstate/cstate/issues/124)** You can think of the cState status page as an informational hub. Because the software is static, it cannot directly monitor any services in real time.

However, cState is a perfect option for recording incidents because most of the time your services are functioning, so the status page does not need to be updated. By default, the little bit of JavaScript on the page improves the user experience but is not required to see the most vital information.

There are other commercial options that may update faster because of their architecture, have built-in real-time uptime monitoring, send notifications by email or other means, but cState is not supposed to be better than paid solutions.



## Getting started 💻

This is how you create a **new site powered by cState.**  What you are generating is a Hugo site with specific, already existing modifications (to Hugo, cState is a theme).
 

### 💚 Netlify and Netlify CMS

cState was built to work best with Netlify and comes with the neccesary files to enable Netlify CMS.

You don't have to use Netlify, but this is the best all-around option:

- To get you started, Netlify is **completely free** (you can pay for extra features, bandwidth, etc)
- It supports all the features you'd want for hosting a modern website: **HTTPS, domain linking, worldwide asset serving, rollbacks, and more**
- As you'd expect, **Netlify CMS** works best with Netlify. **It takes just a few clicks** to make it work


You can simply click this button to get started:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cstate/example)

This sets up cState with its default settings from the [the example repository](https://github.com/cstate/example) repo.

If you cloned the example repository and want to use that newly forked repo, click the 'New site from Git' button in the user dashboard.

These are the settings you should be using:

+ Build command: **hugo**
+ Publish directory: **public**
+ Add one build environment variable
  + Key: **HUGO_VERSION**
  + Value: **0.80** (or later)
+ Also **for the Build image selection, pick Ubuntu Xenial 16.04 or later**

### 🧡 Other great hosting and CMS options

The most popular options, apart from Netlify's offers, are:

* **Hosting:**
    * GitHub Pages
    * GitLab Pages
    * Cloudflare Pages
    * Vercel
* **Admin panels / CMS:**
    * Forestry.io
    * Or just use your Git provider (github.com, gitlab.com, etc)

You can also look at [other headless CMS options **(we use Git-based CMS types)** on jamstack.org](https://jamstack.org/headless-cms/).

### GitLab Pages

Here is a [good guide for getting started with the service.](https://docs.gitlab.com/ee/user/project/pages/#getting-started)

**In short: a `.gitlab-ci.yml` file** is responsible for making cState work. As of v4.2.1, the [cState automatically ships with this file](https://github.com/cstate/cstate/releases/tag/v4.2.1), but support is still experimental.

As of this time, this is a relatively untested option, but Hugo does seem to generate the right things (this can be checked by downloading the **CI/CD artifacts**).

According to GitLab, it may take up to 30 minutes before the site is available after the first deployment.

You can [make Netlify CMS work on GitLab](https://www.netlifycms.org/docs/gitlab-backend/), but that requires overriding an existing file in the theme. Create a file in `static/admin/config.yml` and follow the instructions linked earlier. (cState by default ships with Git Gateway for Netlify.)

### GitHub Pages, Cloudflare Pages, Vercel, Forestry, and others

There is no official, separate documentation for these, but if you look below to see how to deploy manually, the instructions will be the same everywhere.

### Doing it on your PC

Keep reading to see how to deploy manually. Developers wishing to contribute, scroll to the very bottom.

### Manual builds

For this tutorial, it is assumed that you have Hugo and Git installed (check with `hugo version` & `git --version`).

> A minimum version of `0.80` is required for Hugo, starting with v5.

#### I want to use my site in production

[Clone the example repository](https://github.com/cstate/example):

```bash
git clone --recursive -b master https://github.com/cstate/example.git
```

(We are using `--recursive` because the site will not generate with an empty `themes/cstate` folder.)

Now you can edit what's inside the folder (`example`) and try previewing that with this command:

```bash
hugo serve
```

Once the changes you wanted done are finished, generate the final files like this:

```
hugo
```

And the folder `public` can now be hosted.

The downside with manual building is that, if you do not want to use a solution like GitLab Pages or Netlify, this process will need to happen on your computer. This can be tedious.

### Docker

cState comes with a Dockerfile and Netlify ([according to their article from 2016](https://www.netlify.com/blog/2016/10/18/how-our-build-bots-build-sites/)) uses a similar Docker system to build cState. This is an option for people who prefer Docker and NGINX instead of serverless, but serverless still has the priority in our development. 

[Read wiki](https://github.com/cstate/cstate/wiki/Docker)

## Updating 🎉

**If you are updating from one major version to another, like from v3 to v4, then please [read the migration guides](https://github.com/cstate/cstate/wiki/Usage#migration-guides).**

Assuming the production install instructions were followed, keep cState updated by having an up to date Git submodule in the `themes` folder. containing this repository. **Your content should stay separate from the guts of cState.**

Ask yourself these questions:

1. Do I already have the **up to date** Git repository with my status page on my computer?
  * If not, go to your desktop or somewhere else, where you can download your Git repository and run: `git clone --recursive <your repo link goes here> && git submodule foreach git pull origin master`.
  * In the parent directory, type `hugo serve`. Check to see if everything is working.
  * Then do `git add -A; git commit -m "Update cState"; git push origin master; exit`. Your status page is now updated.
2. If you **DO** have the directory, go inside `themes/cstate`. If that is empty, it is easier to delete your local copy and do the steps outlined earlier.

There is currently no easier way to do this, unfortunately, you will need the terminal / command line / Git Bash, unless you want to create a new status page from scratch and move your data over manually.

More info about submodules: [updating](https://stackoverflow.com/a/5828396) & [cloning](https://stackoverflow.com/questions/3796927/how-to-git-clone-including-submodules).

## FAQ 🤔

### What should be the first thing I do after downloading the example repository? What do I edit?

Most of the settings are in the `config.yml` file or under _Settings_, if you have set up Netlify CMS.

### How do I create issues?

#### Using an admin panel (Netlify CMS)

This takes a little more effort to set up but pays off in the long run — [see the wiki](https://github.com/cstate/cstate/wiki) for up to date information.

#### Doing it from the Git repository

Create a file in `content/issues`. The name of the file will be the slug (what shows up in the URL bar). For example, this is what `2017-02-30-major-outage-east-us.md` should look like:

```md
---
title: Major outage in East US
date: 2017-02-30 14:30:00
resolved: true
resolvedWhen: 2017-02-30 16:00:00
severity: down
affected:
  - API
section: issue
---

*Monitoring* - After hitting the ole reboot button Example Chat App is now recovering. We’re going to continue to monitor as everyone reconnects. {{< track "2018-04-13 16:50:00" >}}

*Investigating* - We’re aware of users experiencing unavailable guilds and issues when attempting to connect. We're currently investigating. {{< track "2018-04-13 15:54:00" >}}
```

This is what you would see for an issue that has been resolved.

Time to break that down.

`title`: This is the one of the most important parts of an incident. *(required)*  
`date`: An ISO-8601 formatted date. Does not include time zone. This is when you first discovered the issue. *(required)*  
`resolved`: Whether issue should affect overall status. Either `true` or `false`. *(boolean, required)*  
`resolvedWhen`: An ISO-8601 formatted date. Does not include time zone. This is when downtime stopped. You may set the time that downtime ended without completely resolving the issue (thus leaving time for monitoring).  
`severity`: If an issue is not resolved, it will have an applied severity. There are 3 levels of severity: `notice`, `disrupted`, and `down`. If there are multiple issues, the status page will take the appearance of the more drastic issue (such as `disrupted` instead of `notice`). *(required)*  
`affected`. Add the items that were present in the config file which should alter the status of each individual system (component). *(array, required)*  
`section`. This must be `issue`, so that Hugo treats it as one. *(required)*  

You don't have to define a date for `resolvedWhen` when the issue is not resolved (obviously):

```md
---
title: Major outage in East US
date: 2017-02-30 14:30:00
resolved: false
severity: down
affected:
  - API
section: issue
---

We are looking into this...
```

### Is that it?

For this very basic tutorial, yes.

### I have more questions!

Check out [the wiki](https://github.com/cstate/cstate/wiki).

## Contribute 💥

### Making a change in the code for the cstate/cstate repo

PRs should be submitted to the `dev` branch, if it exists. Before submitting a pull request, create an issue to [discuss the implications of your proposal](https://github.com/cstate/cstate/issues).

The root directory is where the theme itself is (the cState guts, basically) and the `exampleSite` folder houses all content for your specific site. Use this local setup to experiment before making a PR.

Here is a guide for how you should develop:

1. Clone this repository in the command line:

```bash
git clone --recursive -b master https://github.com/cstate/cstate.git
```

2. Launch the development setup like this:

```bash
# old command
# navigate to the directory where your content is and start dev server from there
cd cstate/exampleSite
hugo serve --baseUrl=http://localhost/ --theme=cstate --themesDir=../.. --verbose
# new command partially works for v5.0.2; does not load images from static/
# for this you need to be in the theme root
hugo serve --config=exampleSite/config.yml --theme=../ --contentDir=exampleSite/content
```


### For translators

[See this](https://github.com/cstate/cstate/wiki/Translations#add-your-translations).

### Code of conduct

[Be kind](/CODE_OF_CONDUCT.md).

## License ✍

[MIT](https://github.com/cstate/cstate/blob/master/LICENSE.md) © [Mantas Vilčinskas](https://vilcinskas.me)

A special thanks to all [the contributors](https://github.com/cstate/cstate/graphs/contributors)

**Note about versions**

We use semantic versioning. Version numbers are logged in the console (JS partial), the HTML — the `meta[generator]` tag (meta partial), and API index (index.json).
