---
Title: Catastrophic DNS failure
Description: After moving from one Minecraft server to another, some DNS settings had unknowingly been tweaked which caused a complete outage for everything hosted on our domain.
Date: 2017-04-04T15:58:32
Section: post
---

##### Post-mortem

On Monday, we switched our Minecraft game server’s DNS records to point from the old box in Seattle to the one which is currently in Bristol. According to our host, SpartanHost, “the domain for [our DNS] expired so working on getting it transferred”.

We did salvage our domain before our host made the realization that our nameservers went kaput. This should not happen in the forthcoming feature as we are now using [Netlify](https://www.netlify.com) (and supposedly Amazon) for our DNS and nameserver setup.

##### Another update (2017-04-06T14:48:40)

Most services back up. Some sites still may not work; we’re working on it.

##### Update (2017-04-04T17:16:48)

Switched to different nameserver and DNS provider. Services are recovering.

##### Initial report (2017-04-04T15:58:32)

A DNS change of some sort occurred that removed critical metadata after the server move. We switched name servers—which takes a while—but this should ensure smoother sailing forward. There is nothing else we can do at the moment—however—you can join the server with this IP for the time being: pgmc.mcs4.me
