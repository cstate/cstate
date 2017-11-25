# cState

[![GitHub last commit](https://img.shields.io/github/last-commit/mistermantas/cstate.svg?style=flat-square)](https://github.com/mistermantas/cstate/commits/master)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/mistermantas/cstate.svg?style=flat-square)](https://github.com/mistermantas/cstate/tree/master/)
[![Discord](https://img.shields.io/badge/discord-join%20chat-7289DA.svg?style=flat-square)](http://discord.io/choraleapp)  [![Twitter](https://img.shields.io/twitter/follow/mistermantas.svg?style=social&label=Follow)](https://twitter.com/mistermantas)

> The fastest and most efficient status page on the market, beating even paid solutions. cState has outstanding browser support (IE8+) and can easily be managed with GitHub Pages or Netlify. Ready for production.

[**See real-world example**](https://status.rabbitnode.com)

## Contents

+ [Features](#features)
+ [Install](#install)
+ [FAQ](#faq)
+ [Contribute](#contribute)
+ [License](#license)

## Features

+ Built with [Hugo](https://gohugo.io), a hyperfast Golang generator
+ Works not just on mobile browsers, but also on archaic browsers like Internet Explorer 8
+ Comes with a simple, focused, and extremely light design
+ Edit your status page just from the config file
+ Comes pre-equipped with Netlify CMS for quick updates
+ Easy to edit and deploy on Netlify or GitHub Pages

## Install

We encourage you to use [Netlify](https://www.netlify.com) for cState. The build command is `hugo` and your site is compiled to `public`.

For this tutorial, it is assumed that you have Hugo and Git installed (check with `hugo version` & `git --version`).

**This does not seem to work in one go on PowerShell, so enter each command individually.**

```bash
# 1. First off, we initialize the Git repository
# !: If you already have one, skip this step
git init;

# 2. Then this creates all the necessary directories
mkdir -p content/issues, themes, static;

# 3. We get the config file
curl -o config.yml https://cdn.rawgit.com/mistermantas/cstate/master/config-example.yml;

# 4. Download cState
cd themes; git submodule add https://github.com/mistermantas/cstate;

# 5. Last off, start the server locally
cd ../; hugo serve;
```

And that is it; you have set up cState locally.

Now is a good time to make cState look the way you want it to, so upload a favicon (and logo) to `/static/`. Edit `config.yml` to fit your needs. And so on, and so forth.

**Do not change any files in the `themes` directory or its subdirectories. Everything is handled automatically by Git.**

To make the status page public, you will need to connect to a remote GitHub repository much like this:

```bash
# Create a remote origin like this (if you have not already)
git remote add origin https://github.com/username/example.git

# Add all the files
git add -A

# Then a message based on your changes
git commit -m "Testing out cState"

# All done
git push -u origin master
```

For an example of a working status page, see [rabbitnode/status](https://github.com/rabbitnode/status).

## FAQ

### Where do issues go? What is the frontmatter, how do I define metadata for issues?

Create a file in `content/issues`. The name of the file will be the slug (what shows up in the URL bar). For example, this is what `i-am-an-issue.md` should look like:

```md
---
Title: Give your issue a good title
Description: This description is here merely for metadata purposes and may show up in search results. It may be used as a summary.
Date: 2017-02-30 14:30
Resolved: true
Severity: down
Affected:
  - Client Area
Section: post
---

Content goes here.
```

Time to break that down.

`Title`: This is the one of the most important parts of an incident. *(required)*  
`Description`: This description is here merely for metadata purposes and may show up in search results. It may be used as a summary.  
`Date`: An ISO-8601 formatted date. Does not include time zone. *(required)*  
`Resolved`: Whether issue should affect overall status. Either `true` or `false`. *(boolean, required)*  
`Severity`: If an issue is not resolved, it will have an applied severity. There are 3 levels of severity: `notice`, `disrupted`, and `down`. If there are multiple issues, the status page will take the appearance of the more drastic issue (such as `disrupted` instead of `notice`). *(required)*  
`Affected`. Add the items that were present in the config file which should alter the status of each individual system (component). *(array, required)*  
`Section`. This must be `issue`, so that Hugo treats it as one. *(required)*  

### Is there an admin panel or some easy way to change the state of each issue?

If you use [Netlify](https://www.netlify.com), you can expect to see Netlify CMS integration very soon. Otherwise, you could fall back to [prose.io](http://prose.io) or something similiar.

### How do I make this work on GitHub Pages?

Compile locally, commit changes, and push them out. We do recommend using [Netlify](https://www.netlify.com), however.

### My question was not answered!

This part of the documentation still needs to finished. [Questions](https://github.com/mistermantas/cstate/issues) are more than welcome and you should get a pretty fast response as well.

## Contribute

+ Glance over the [Code of Conduct](/CODE_OF_CONDUCT.md).
+ Before submitting a pull request, create an issue to [discuss the implications of your proposal](https://github.com/mistermantas/cstate/issues).
+ Write consistent, simple, and readable code. You can [join the Chorale Discord](http://discord.io/choraleapp) to discuss in `#cstate`.

## License

MIT © Mantas Vilčinskas
