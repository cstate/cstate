---
title: Unavailable Guilds & Connection Issues
date: 2018-04-13 15:54:00
resolved: true
resolvedWhen: 2018-04-13 17:30:00
# Possible severity levels: down, disrupted, notice
severity: down
affected: [API, Media Proxy]
section: issue
---

*Post-mortem*

At approximately 14:01, a Redis instance acting as the primary for a highly-available cluster used by our API services was migrated automatically by Google’s Cloud Platform. This migration caused the node to incorrectly drop offline, forcing the cluster to rebalance and trigger known issues with the way our API instances handle Redis failover. After resolving this partial outage, unnoticed issues on other services caused a cascading failure through Uncascade Demo’s real time system. These issues caused enough critical impact that the Uncascade Demo team was forced to fully restart the service, reconnecting clients over a period of 20 minutes.


---

*Update* - A fix has been implemented and we are monitoring the results. Looks like this has been fixed. {{< track "2018-04-13 17:30:00" >}}

*Monitoring* - After restarting the affected service, Uncascade Demo is now recovering. We're going to continue to monitor as everyone reconnects. {{< track "2018-04-13 16:50:00" >}}

*Investigating* - We're aware of users experiencing unavailable guilds and issues when attempting to connect. We're currently investigating. {{< track "2018-04-13 15:54:00" >}}
