# cState

[![Discord](https://img.shields.io/badge/discord-join%20chat-7289DA.svg?style=flat-square)](http://discord.io/choraleapp)  [![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)  [![Twitter](https://img.shields.io/twitter/follow/choraleapp.svg?style=social&label=Follow)](https://twitter.com/polargalaxymc)

> Blazing fast status page with excellent browser support. Built with Hugo. Work in progress, may have bugs and incomplete features.

Is [statuspage.io](https://www.statuspage.io/) too expensive? Do you need an open source alternative for your project that is supported on archaic browsers like IE8 and never stops beating? cState is here to help.

[Live demo](https://status.choraleapp.com)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mistermantas/cstate)

## Usage

To set up cState, do the following:

1. Deploy the status page, preferably using [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/mistermantas/cstate) and/or [GitHub Pages](https://pages.github.com).
2. Upload your favicon and logo to `/static/` and edit `config.yml`.

Once that is done, you can create a new post like this:

```
hugo new incident/dns-killed-us.md
```

Then, go into `incident/dns-killed-us.md` and follow this format:

```md
---
Title: Catastrophic DNS failure
Description: After moving from one server to another, some DNS settings had unknowingly been tweaked which caused a complete outage for everything hosted on our domain.
Date: 2017-04-04T15:58:32
Section: post
---

##### Post-mortem

On Monday, Amazon gave up on us.
```

## Features

+ Built with [Hugo](https://gohugo.io), on a sturdy foundation
+ Works everywhere: all modern browsers, even IE8 and later
+ You can subscribe to web notifications for status updates
+ Simple, focused, and robust design
+ Easy to edit and deploy

## Resources

+ [Issue tracker](https://github.com/mistermantas/cstate)
+ [Code repository](https://github.com/mistermantas/cstate)

## License

MIT © Mantas Vilčinskas
