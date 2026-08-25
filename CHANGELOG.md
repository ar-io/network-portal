# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.10.0] - 2026-08-25

### Added

- The staking page shows what your delegations have actually earned, per gateway
  and per epoch, alongside the yield that works out to.

  A consequence worth knowing: the earnings are measured, but the yield is not a
  rate to expect. It divides everything you have earned by the stake you hold
  today, so if you have added or withdrawn since, it is measured against a
  balance that did not earn those rewards. The network's own figure sits beside
  it for comparison — across the whole network the two differ by about six
  times, so the comparison is the point.

  Gateways pass on anywhere from 0% to 95% of their rewards, so the same stake
  earns very differently depending where it sits. One wallet's eleven positions
  currently range from 2.8% to 12.4%.

- The dashboard charts what flows into the protocol treasury each epoch, in ARIO
  or in dollars.

  A consequence worth knowing: it is called inflow rather than revenue because
  it measures everything that moved into the treasury and cannot separate
  registration fees from one-off transfers. One epoch in the current window
  contains a 60 million ARIO deposit that is not income; it is drawn in amber
  and clipped, because at true scale it would flatten every other epoch to a
  hairline. Dollar figures use the ARIO price at each epoch, so they are what
  that inflow was worth at the time.

- The dashboard shows how much of the network's auditing is independent work.
  Observers are meant to assess the network on their own, and each epoch some of
  them file a report another observer had already filed. The chart tracks that
  share over time.

  It is deliberately the one measure here that needs no interpretation: two
  observers submitting the same report transaction is the same report under two
  wallets, not an inference about who they are.

  A consequence worth knowing: an epoch that only a handful of observers reported
  is marked in amber. Two observers filing two reports is 100% and means nothing,
  and hiding those epochs would conceal that they were barely observed at all.

- The rules the protocol enforces now appear where they decide what you can do.
  Joining as a gateway operator shows the minimum stake, the withdrawal and leave
  periods, the failed-epoch limit and the reward-share cap alongside the setup
  steps. Staking shows the minimum delegation, the withdrawal period and the
  redelegation and early-withdrawal fees before you commit.

  These are read from the same settings the network checks your transaction
  against, so they cannot drift out of date the way a number copied into the docs
  can.

- Network Statistics shows what delegated stake has actually returned across the
  network — annualised from measured rewards, not projected. Operator returns get
  their own line once the data exists for them, rather than being averaged in:
  they are worked out by comparing stake between epochs, where delegate rewards
  are read from the network's own records.

- Network Statistics now includes the total number of ArNS names and the demand
  factor — the multiplier applied to ArNS registration prices, which rises as
  names are bought and settles when demand slows.

- The infrastructure panel lists the five largest hosting providers rather than
  only the largest. On the current network the top five account for 86% of the
  gateways analysed, which one figure could not convey.

- Every column on the staking table can be sorted.

### Changed

- The gateway and staking pages now open the same way: what you do on the left,
  what the protocol requires on the right. They are the network's two ways in —
  running a gateway or backing one — and presenting them differently made them
  look like unrelated features. The staking copy says what a delegator actually
  gets rather than describing the mechanism.

- Rewards by Epoch can be shown in dollars as well as ARIO, and takes up a third
  less room. Each epoch is valued at the ARIO price on that day, so the figures
  are what those rewards were worth at the time. The most recent epochs are
  usually not priced yet and are left blank rather than drawn as zero.

- The dashboard fits more on screen. The three action cards at the top are about
  half their previous height on a wide display, and the panels below them are
  arranged in even rows.

- The token supply chart gives each slice its own shade. Previously every slice
  was the same colour and only the one under your cursor changed, so the legend
  could not identify anything without hovering it first.

- The staking page opens with one card instead of three. The invitation to
  connect, the link explaining how delegated staking works, and the protocol
  limits were saying overlapping things in three places.

- The sidebar links to the ARIO market on Raydium in place of the bridge, which
  is being retired along with the token it bridged.

### Fixed

- Switching Rewards by Epoch to dollars converted the chart but not its hover
  labels, which still said ARIO — so it showed dollar amounts under a token
  label.

- Every page showed a horizontal scrollbar it never needed. The scrolling area
  was set to scroll in both directions, so the bar was drawn whether or not
  anything was wider than the screen.

- Table headers no longer hid their own controls on a phone. The search box was
  wider than the screen, which pushed it and the page controls off the edge of
  the card where they could only be reached by scrolling a bar that gave no sign
  it scrolled.

- The link to swap for ARIO wrapped onto two lines in the sidebar.

- The page buttons under every table had no background and no hover response.

- Sorting the staking table by performance, yield or reward share put every row
  with no data first, which is the opposite of what sorting ascending is for.

- The staking rewards card is no longer disabled. It read a source that was never
  populated, so it reported zero for every wallet — it now reads the published
  rewards and has been rebuilt around them.

## [2.9.0] - 2026-08-25

### Added

- Network-wide lists — gateways, balances, vaults and delegations — are now read
  from a published snapshot instead of being rebuilt in every visitor's browser.
  Those four reads scanned the entire network on each load, so the cost grew with
  the site's popularity.

  A consequence worth knowing: those four lists can be up to about ten minutes
  old. Anything the snapshot cannot answer — or that is stale, or published for a
  different network — falls back to reading the network directly, so the app
  behaves exactly as before whenever the service is unavailable. Your own
  balances, delegations and withdrawals are always read live.

- Past epochs now show their observations again. The records live on-chain only
  until an epoch pays out, after which they are deleted, so older epochs had
  nothing to show.

  A consequence worth knowing: for a past epoch we can show how many gateways
  each observer passed, but not which ones. Those results are recorded against a
  list of gateways whose order is not published, and matching them against
  today's list would name the wrong gateways. The gateway page says "Unknown"
  for those epochs rather than showing a pass it cannot stand behind.

- The dashboard has three new panels: which release versions gateways are
  running, where they are hosted, and which countries they are in.

- A gateway's page now shows the network, hosting provider and location it
  resolves to, and how many other gateways share that infrastructure.

- The observers table now shows what share of gateways each observer passed, and
  how often it submitted the same report as another observer. Below it, the
  correlations the analyzer detected for that epoch are listed with the reason
  for each. These describe what the data shows; the analyzer reports its own
  scoring as uncalibrated, so treat them as leads rather than conclusions.

- Settings has a Network Services URL, with presets for the published endpoints,
  a field for your own, and an option to turn it off entirely — in which case
  everything is read directly from the network, as before.

### Changed

- The observers table no longer scrolls sideways on a normal screen. The gateway
  and observer address columns are hidden by default; both are still available
  from the column selector, and clicking a row opens the gateway, which shows
  them in full.

### Fixed

- The reports page listed nothing. It asked the chain for records that had
  already been deleted, and separately, its request for each report's size and
  version could never succeed against the configured index — which is why those
  columns were always empty. Reports with no size or version now show a dash
  rather than a zero and a 1969 date.

- Sorting the gateways table by streak ranked only passing runs, so sorting
  ascending — what you do to find the worst-performing gateways — grouped every
  failing gateway together with no relation to how badly it was failing.

- A gateway's epoch card announced a green "Passed" before its results had
  loaded, and again for past epochs where the result is not knowable.

- A gateway's ASN was shown with a doubled prefix, as ASAS214996, and repeated
  the provider name already displayed beside it.

## [2.8.0] - 2026-08-24

### Changed

- The dashboard downloads about half as much data when you come back to it. The
  Network Statistics panel — total addresses, unique delegates, total vaults —
  used to read every balance, every delegation and every vault on the network
  each time the page loaded, purely to count them. Those three counts are now
  remembered in your browser for an hour.

  A consequence worth knowing: those three numbers can be up to an hour old.
  Nothing else on the dashboard is cached this way, and no balance, stake or
  reward figure is affected.

- Releases now reach you within about five minutes of being published, instead
  of up to an hour. The record that points at the app carried a one-hour cache,
  so a release could be live and still unreachable for that long — which is what
  happened with the 2.6.0 connection fix.

## [2.7.0] - 2026-08-24

### Changed

- Sorting the gateway, staking and balances tables is now instant. Changing a
  column previously refetched the entire dataset from the network before
  reordering it; the data is already in the browser, so it is now reordered
  there. A consequence worth knowing: sorting no longer refreshes the numbers,
  so a sort shows the data as of the last load. Your own staking and withdrawal
  actions still refresh everything immediately.

### Fixed

- The gateway and staking tables could keep showing pre-transaction figures for
  up to an hour after staking, unstaking or redelegating. They now refresh along
  with everything else.

### Removed

- Background fetching of table data nobody had asked for. The Balances page
  speculatively downloaded the full dataset for sort orders the visitor had not
  selected.

## [2.6.1] - 2026-08-23

### Changed

- Release notes rewritten. Earlier entries described internal implementation detail;
  they now describe what actually changed for you. No functional changes in this
  release.

## [2.6.0] - 2026-08-23

### Fixed

- The portal could overwhelm the network when an endpoint became slow or unreachable.
  Instead of easing off it kept firing requests at full rate, and quietly diverted them
  to a shared public endpoint — which made a bad connection worse rather than better.
  Requests are now paced properly, and the portal no longer falls back to a public
  endpoint on its own.
- Moving between pages quickly could make a healthy endpoint look unhealthy and send
  traffic somewhere else unnecessarily.

### Changed

- Failed requests are retried far less aggressively. A single failing request could
  previously be attempted up to twelve times, which slowed recovery instead of helping.
- The dashboard loads with fewer network requests, so it comes up faster — most
  noticeably on a busy or rate-limited endpoint.
- You can now point the portal at a second, backup endpoint if you have one. Without
  one, a failure surfaces as an error and you can switch endpoints in Settings rather
  than being silently moved onto a shared public one.

## [2.5.0] - 2026-08-19

### Removed

- Third-party error reporting. The portal no longer loads an error-tracking SDK or
  sends any data about your session to an external service.

### Changed

- Much smaller download. The published build dropped from roughly 18 MB to under
  5 MB, so the portal loads faster — noticeably so over a gateway or a slow
  connection.

## [2.4.1] - 2026-08-18

### Fixed

- The portal failing to load network data, showing "401 Unauthorized", for anyone
  who had used it before. Saved settings kept a network endpoint that was no longer
  valid, and nothing replaced it when a new one shipped. Stored network settings now
  update automatically when the app ships a new default, so clearing browser storage
  is no longer necessary.

## [2.4.0] - 2026-08-17

### Fixed

- Claiming rewards no longer stops at the first failure. Each withdrawal and vault
  release is its own transaction, so one failing no longer strands the others.
  Declining a signature now ends the run instead of prompting again for every
  remaining item, and the summary reflects what actually processed rather than the
  full claimable amount.
- Custom RPC endpoints configured for local development were silently ignored.

### Changed

- Network endpoints are configured per deployment rather than built into the source.
  A production release now refuses to publish if they are missing, so it can no longer
  ship a build that quietly falls back to a public, rate-limited endpoint.

### Security

- Network provider credentials are no longer kept in the repository. Note that any
  endpoint the portal talks to is visible to anyone running the app — these
  endpoints are protected by access controls at the provider rather than by being
  secret. You can always point the portal at your own endpoint in Settings.

## [2.3.2] - 2026-08-10

### Fixed

- Observer Performance chart showing 0 observations for all past epochs. Observation PDAs are deleted once an epoch distributes (rent refund), so counting them always returned 0. Now reads the durable `observationsSubmitted` counter from the Epoch account instead.
- Epochs without an observation counter (SDK fallback path) are omitted from the chart rather than rendered as 0.

## [2.3.1] - 2026-07-29

### Fixed

- Vault release and withdrawal claim failing with `SyntaxError: Cannot convert <address> to a BigInt`. Bumped `@ar.io/sdk` to `4.1.0-alpha.2` so `getVaults`/`getWithdrawals` return the numeric per-owner vault id (ar-io/ar-io-sdk#692) instead of the base58 vault PDA that `releaseVault`/`claimWithdrawal` rejected when deriving the on-chain PDA via `BigInt()`.

### Added

- Per-vault Release action and modal on the Balances page for unlocked (expired) vaults.

## [2.2.1] - 2026-06-18

### Added

- Total Epoch Emissions bar chart on Dashboard (rewards budget per epoch)
- Gateways in Network panel on Dashboard with epoch trend chart

### Changed

- Simplify GatewaysInNetworkPanel (self-contained, hardcoded 7-epoch limit)
- Update reference gateway FQDN to turbo-gateway.com


## [2.2.0] - 2026-06-17

### Added

- Live epoch observation data on Observers page (report status, failed gateways)
- Prescribed ArNS names bar on Observers page
- Observer Performance panel on Dashboard with proper chart layout
- Gateway detection via /ar-io/info for relative Arweave data URLs

### Fixed

- Replace arweave.net with turbo-gateway.com for data fetching and goldsky for GraphQL
- Fix observer address keying in Banner (use observerAddress, not gatewayAddress)
- Fix failed gateways column showing "Pending" for 0 failures (nullish coalescing)
- Work around SDK base58 memcmp browser bug with direct base64 RPC calls
- Replace ~55 RPC call getCurrentEpoch with lightweight 2-call fetch
- Remove all auto-polling intervals (slot, balances, observations)
- Remove Solana slot display from header
- Pin @ar.io/sdk to 4.0.2-alpha.9

### Changed

- Reduce staleTime on epoch/gateway/observer hooks from 1h to 5m
- ObserversTable reads prescribedObservers from epoch data directly (eliminates ~55 redundant RPC calls)
- SnitchRow and Dashboard panel use live useObservations hook instead of stale epoch object

## [2.1.0] - 2026-06-16

### Added

- Solana gas price views

## [2.0.0-solana.0] - 2026-05-13

### Added

- Initial Solana migration with wallet adapter support and a new wallet bridge flow
- Dynamic wallet type detection for supported Solana wallets
- Devnet-first configuration for the migration branch

### Changed

- Reworked app initialization, global state, settings, and routing to support the Solana wallet stack
- Updated network, balance, gateway, and modal flows for Solana-specific behavior
- Bumped `@ar.io/sdk` to `4.0.0-solana.14`
- Updated versioning and test expectations for the migration branch

### Fixed

- Hardened modal validation and wallet write-state handling
- Corrected vault balance filtering and total balance tallying
- Fixed reward calculations used on gateway operator stake views

### Removed

- Legacy wallet provider and connectors that were replaced by the Solana wallet bridge
- Arweave-specific transaction and address utilities no longer used in the Solana migration

## [1.24.4] - 2026-05-06

### Changed

- Updated Solana migration snapshot date from May 15 to June 1, 2026

## [1.24.3] - 2026-04-27

### Added

- Site-wide Solana migration announcement banner with Learn More link
- Banner auto-hides after May 15, 2026 snapshot date

### Fixed

- Mobile hamburger menu positioning now adapts to banner height dynamically
- Content area overflow when multiple banners are displayed

## [1.24.2] - 2026-01-23

### Changed

- Updated app logo to ar.io wordmark in expanded sidebar
- Updated favicon to new circular ar.io icon
- Updated collapsed sidebar to display larger ar.io logo

## [1.24.1] - 2026-01-13

### Added

- Search functionality to Gateway Assessments table on Report page

### Fixed

- Consistent padding on Report page

## [1.24.0] - 2026-01-09

### Added

- Interactive staking rewards visualization with epoch-based chart and selector
- Percentage change badges for ArNS Stats and Observer Performance panels
- New `useRewardsForAddress` hook for efficient rewards data fetching with React Query caching
- Dynamic rewards display showing individual epoch rewards on hover vs. total earned by default
- Epoch range selector (1 week, 1 month, 3 months, 6 months) for rewards tracking

### Enhanced

- Staking page now displays larger, more prominent balance values in redesigned cards
- Enhanced `Streak` component to handle 0% changes with green styling and up arrow
- Rewards chart excludes current epoch data since rewards are only distributed when epochs complete
- Chart scaling improvements with minimum Y-axis value of 1 for better visualization
- Loading states with placeholder skeletons instead of misleading zero values

### Changed

- Staking rewards card now shows cumulative rewards by default with individual epoch details on hover
- Percentage change calculations now contextually switch between total vs. individual epoch comparisons
- Chart axes are hidden for cleaner appearance while maintaining proper data scaling
- Rewards data rounded to one decimal place for improved chart readability

## [1.23.3] - 2026-01-09

### Enhanced

- Added interactive hover functionality to dashboard charts with epoch information display
- Added pink circle highlights on chart hover for ArNS Stats and Observer Performance panels
- Unified chart styling across all dashboard panels with consistent pink color scheme and opacity
- Enhanced Observer Performance panel to display epoch-specific observations count on hover

### Changed

- Aligned chart fill colors and gradients across ArNS Stats, Observer Performance, and Gateways panels

## [1.23.2] - 2026-01-08

### Changed

- Use grid layout for dashboard panels for improved responsiveness and consistent spacing

## [1.23.1] - 2026-01-07

### Fixed

- Consistent padding on all pages

## [1.23.0] - 2026-01-07

### Changed

- Updated ArNS Stats Panel: renamed header to "ArNS Names", moved count to left, added demand factor display on right
- Fixed ArNS Stats chart Y-axis domain to properly show data variation
- Bumped `@ar.io/sdk` to `3.23.0-alpha.3`

## [1.22.4] - 2026-01-07

### Fixed

- Use client-side sorting on `GatewaysTable` when sorting by `totalStake`
- Fix `My Gateway` overlay on Gateways page

## [1.22.3] - 2025-12-28

### Changed

- Improved responsive padding and overflow handling across all pages
- Added consistent horizontal padding (px-4 on mobile, px-6 on desktop)
- Fixed overflow issues with proper scrollbar styling
- Added overflow-x-auto to table headers for better mobile experience
- Simplified layout structure by removing redundant wrapper divs

## [1.22.2] - 2025-12-19

### Fixed

- Fixed inconsistent padding on page headers
- Updated `@ar.io/sdk` to `3.22.2` to fix historical ArNS stats chart

## [1.22.1] - 2025-12-18

### Added

- Added Bridge link in sidebar navigation that links to swap.ar.io

### Fixed

- Fixed Explorer link in sidebar navigation to correctly link to scan.ar.io/#/entity/ instead of scan.ar.io/entity/
- Fixed height of Observer Performance panel chart to prevent layout shift on data load

## [1.22.0] - 2025-12-17

### Added

- Added new CTASection component with Join Network, Delegate to Gateways, and Transfer ARIO call-to-action cards
- Added EpochSelector component with time-based options (Last 1 Week, Last 2 Weeks, Last 1 Month, Last 3 Months, Last 6 Months)
- Added dynamic epoch fetching hooks (useEpochsWithCount, useGatewaysPerEpochWithCount) that fetch the requested number of historical epochs
- Added epoch selection controls to Gateways in Network and Rewards Distribution panels with synchronized state
- Added edge-to-edge background charts to Observer Performance and ArNS Stats panels
- Added historical data hooks (useObserversWithCount, useArNSStatsWithCount) for dashboard charts

### Changed

- Enhanced Dashboard layout with CTA section at the top and reorganized existing panels
- Updated Gateways in Network and Rewards Distribution panels to support dynamic epoch count selection
- Fixed ARIO Token Distribution chart sizing issues that occurred on hover
- Moved Network Statistics panel above IO Token Distribution panel in left column
- Changed default epoch display from 7 to 30 epochs (1 month)

### Fixed

- Resolved chart container width conflicts in IOTokenDistributionPanel that caused layout shifts on hover
- Fixed epoch data fetching to actually retrieve historical data instead of being limited to hardcoded 13 epochs

## [1.21.1] - 2025-12-17

### Added

- Added Explorer link in sidebar navigation that links to scan.ar.io

### Changed

- Updated "Join X gateways" text to show dynamic total gateway count instead of hardcoded value
- Changed Network Statistics header from gradient to gray text
- Removed "Key metrics for the network" subtitle from Network Statistics panel
- Added info icons with tooltips next to Network Statistics labels instead of tooltips on values
- Updated Tooltip component to support positioning (side prop)
- Updated Process link to dynamically use ARIO_PROCESS_ID

### Fixed

- Confirmed Start a Gateway card scrolls naturally without fixed positioning

## [1.21.0] - 2025-12-15

### Added

- Enhanced Balances page with comprehensive token distribution visualization
- Added pagination and search functionality to all tables
- Added subtle purple gradient hover effect to clickable table rows

### Changed

- Updated Network Stats panel metrics
- Made balances panels equal size and responsive
- Moved % of Supply column to last position in balances table
- Updated EAY calculation

### Fixed

- Fixed mobile sidebar not closing when navigating to new page
- Fixed table header alignment and naming
- Fixed total joined gateways count using contract value
- Fixed AR.IO Scan URLs to use /entity/ instead of /wallet/
- Fixed transaction history display for Ethereum users

## [1.20.0] - 2025-12-09

### Added

- Added styled scrollbars across all pages for consistent appearance

### Changed

- Replaced ao.link transaction explorer links with AR.IO Scan (scan.ar.io)
- Added cross-env for Windows development compatibility

### Fixed

- Fixed missing scrollbars on Balances, Dashboard, Gateways, Staking, and Observers pages
- Fixed BalancesForAddress page layout to match standard page structure

## [1.19.1] - 2025-11-13

### Fixed

- Gateway Assessments Table: Show separate row for each expected wallet when multiple wallets use the same observed host

## [1.19.0] - 2025-10-28

### Added

- X-402 pricing information display on individual gateway pages

## [1.18.0] - 2025-10-27

### Added

- Improved table loading states with skeleton rows for better user experience

### Changed

- Extended cache times from 5 minutes to 1 hour for better performance
- Optimized data processing in Gateways, Staking, and Observers tables

### Fixed

- Eliminated "no data found" flash when switching between tabs
- Fixed table loading states to maintain skeleton rows during data processing
- Improved consistent loading behavior across all tables

## [1.17.1] - 2025-10-17

### Fixed

- Fix epoch data retrieval

## [1.17.0] - 2025-10-08

### Added

- Reports: Added Offset Assessments column with pass/fail/skip status, and show offset assement results in observation details

## [1.16.1] - 2025-09-25

### Fixed

- Fix observer balance warning using incorrect value for Turbo credits

## [1.16.0] - 2025-09-03

### Added

- Added column selectors for tables

## [1.15.0] - 2025-08-27

### Changed

- Initial support for mobile view

## [1.14.1] - 2025-07-16

### Fixed

- Fix loading extension marketplace from ArNS URL

## [1.14.0] - 2025-07-11

### Added

- New Extension Marketplace page allowing users to browse, search, and filter gateway extensions with detailed information pages.

## [1.13.1] - 2025-06-25

### Fixed

- Optimize loading of primary names for wallets that do not have a primary name set

## [1.13.0] - 2025-06-18

### Added

- Added low balance check for observer wallet addresses
- Added "Observer" badge next to gateway name when selected as observer in current epoch
- Added Streak display to gateway page

### Changed

- Updated redelegation confirmation to require typing "CONFIRM"

### Fixed

- Fixed logout button styling to prevent visual bleed
- Fixed issue handling arweaveWalletLoaded event triggering continously after page load

## [1.12.1] - 2025-05-28

### Fixed

- Fix stakes dropdown to allow for access to redelegation workflow

## [1.12.0] - 2025-05-19

### Added

- Added Beacon Wallet Support (credit to Vela Ventures)

## [1.11.9] - 2025-05-15

### Changed

- Observations: Updated gateway reference host to ar-io.net

## [1.11.8] - 2025-04-24

## Added

- Balances: Added Revoke Vault button to revoke vaults when viewing balances for another address and user is the controller

## [1.11.7] - 2025-04-08

## Added

- Gateway: Shows passed/failed for epoch in Reported On By card
- Observers: Tooltip added to Observer Performance column to show observed and prescribed counts

## [1.11.6] - 2025-03-28

## Changed

- Improved error handling when loading historical epoch data

## [1.11.5] - 2025-03-25

### Fixed

- Disable delegate stake button for gateways operated by logged-in user and direct them to use operator staking.

## [1.11.4] - 2025-03-20

### Updated

- Gateway Details page: show actual number of observers per epoch in "Failed by x/y Observers" card

## [1.11.3] - 2025-03-20

### Added

- Added an error notification when app is unable to retrieve epoch data for an epoch index
- Added fallback retrieval method for epochs when Epoch-Distribution-Notice is not available

### Updated

- Set default graphql endpoint to arweave.net

## [1.11.2] - 2025-03-19

### Changed

- Always show transfer button in Profile menu

## [1.11.1] - 2025-03-12

### Fixed

- Fixed display of controller for vaults in Balances page

## [1.11.0] - 2025-03-06

### Added

- New Balances page for viewing breakdown of ARIO balances and vaulted funds

### Changed

- Update to read min operator stake and max reward share ratio values from process
- Update GQL endpoint to use Goldsky
- Dashboard: Modified from "Rewards Claimed" to "Rewards Distributed" to more accurately represent
  the system
- Dashboard: ArNS Stats panel: Replaced Active Names with Names Purchased in tooltip

### Fixed

- Read error that caused page crash in Dashboard when switching processes in settings
- Fixed handling account switching with Wander
- Fix display of total stake as ARIO instead of mARIO on gateway selector for redelegation

## [1.10.3] - 2025-02-25

### Changed

- Updated to ar.io SDK 3.8.2-alpha.1 for improved retry logic on AO interactions
- Made info icon red on redelegation modal to make it more noticeable for users

## [1.10.2] - 2025-02-20

### Changed

- Updated fee message on Redelegation modal

## [1.10.1] - 2025-02-20

### Changed

- Updated to ar.io SDK 3.8.0

### Fixed

- Allow editing ArNS names for observations when prescribed names are unavailable

## [1.10.0] - 2025-02-20

### Updated

- Application configured for mainnet process
- Modified to handle pre-epoch-zero state

## [1.9.5] - 2025-02-14

### Fixed

- Adjusted rewards calculation to work with new scheme where rewards were unavailable on current epoch

## [1.9.4] - 2025-02-13

### Fixed

- Fixed profile menu errant display of 0 when ARIO balance is 0

## [1.9.3] - 2025-02-13

### Changed

- Added support for account switching with Metamask

### Fixed

- Observer page banner performance field fixed to use updated field from process

## [1.9.2] - 2025-02-12

### Updated

- Revised observations to use ky library and use 5000ms timeout to better match with gateway observer scheme

### Fixed

- Added better error handling for observations

## [1.9.1] - 2025-02-10

### Fixed

- Updated to latest ar.io SDK and updated Dashboard to fix refresh issues when
  switching AR.IO Process in Settings

## [1.9.0] - 2025-02-07

### Added

- Added support for Metamask Wallet
- Added support for sending ARIO using "Transfer ARIO" modal, accessible from Profile menu
- Added Info icon to ArNS Stats panel with tooltip to view additional ArNS stats

### Changed

- Updated wallet name from ArConnect to Wander to reflect new branding
- Minor optimizations for queries

## [1.8.3] - 2025-02-03

### Changed

- Minor fix for property name change.

## [1.8.2] - 2025-02-03

### Changed

- Updated to latest ar.io SDK to support changes in property names for data returned by the network

## [1.8.1] - 2025-01-29

### Fixed

- Clear congestion banner when network returns to normal

## [1.8.0] - 2025-01-28

### Added

- Show ArNS ANT Logo in profile if user is using primary name
- Applications Settings: use new sidebar Settings option to open modal to
  configure ARIO Process ID and AO CU URL
- Added copy button for domain name columns in tables
- Show Delegate EAY for gateways in Active Stakes table

### Changed

- Signing with ArConnect now uses signDataItem API, providing a more informed signing experience.

### Fixed

- Fixed height sizing issue of view port when network congestion banner is shown

## [1.7.0] - 2024-12-20

### Added

- Redelegate Stake: Users can now redelegate stake and pending withdrawals between gateways. Includes moving to/from operator stake and delegated stake.
  Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.

### Changed

- Leave Network: text updated to 90-days for vaulted funds
- Staking: Staking and Withdrawal are now separate modals that are initiated from unique popup menu options

### Fixed

- Gateway Details: Restored "Leave" (when viewing own gateway) and "Stake" (when viewing other gateways) buttons

## [1.6.0] - 2024-12-10

### Added

- Gateway Details
  - Added Operator Stake card showing operator stake and EAY, as well as manage stake button for updating operator stake.
  - Added collapsible Pending Withdrawals card for viewing current withdrawals as well as managing
    them (canceling a withdrawal or initiating an expedited withdrawal). Visible only to the gateway operator.
  - Added collapsible Active Delegates card showing the list of active delegates for the gateway.

## [1.5.0] - 2024-12-04

### Added

- Profile button shows user's ArNS Primary Name (if available) or wallet address when logged in
- Download buttons added to Reports page and individual Report page
- Observers: Added epoch selector to view prescribed observers for previous epochs
- Gateway Details Page
  - Reported On By card: text links to gateway for observer, report button links to report
  - Reported On card: Report button shows in header that links to that report's page

### Updated

- Staking and Withdrawal modals updated to show Review page for user to confirm operation before processing
- Withdrawal Modal: Added option for Standard and Expedited Withdrawal
- Modal dialog styles refreshed
- Reward Share Ratio capped to 95% when joining network and updating gateway settings

## [1.4.3] - 2024-11-27

### Updated

- Settings updated for staking:
  - Staking withdrawals are now 90 days
  - Gateway Operator Stake minimum is now 10,000 IO
  - Minimum Delegated Staking amount for gateway configuration is now 10 IO

## [1.4.2] - 2024-11-20

### Updated

- Show error message toast if the application is unable to retrieve the current epoch

## [1.4.1] - 2024-11-18

### Updated

- Optimized loading of user stakes and pending withdrawals.

### Fixed

- Gateways count in site header should only count active gateways.

## [1.4.0] - 2024-11-14

### Added

- View Pending Withdrawals on Staking page and support cancelling pending withdrawals as well as performing expedited withdrawals
- View Changelog in app by clicking version number in sidebar

### Updated

- Staking page top cards now show balance, amount staking + pending withdrawals, and rewards earned last 14 epochs and last epoch

### Changed

- Updated header style of cards
- Observations: Updated to use arweave.net for reference domain when generating observation report
- Observe: Default to using prescribed names

## [1.3.0] - 2024-10-21

### Added

- New Dashboard home page that visualizes data for the state of the gateway network

## [1.2.0] - 2024-10-17

### Added

- “Reported On” and “Reported On By” cards on Gateway Details page for viewing observation status by epoch for a gateway
- “Software” card on gateway details page that shows gateway software version and available bundlers (if gateway has listed them)

### Changed

- Updated Gateway Details page for leaving gateways to hide non-relevant cards and show leave date

## [1.1.0] - 2024-10-08

### Added

- Gateways > Reports: Add “AR.IOEpoch #” Column
- Gateways>Reports>Individual Reports
  - Add Epoch #
  - Remove Epoch start height
- Implemented Leave Network Flow:
  - Adds button to Gateway Detail page to leave network when gateway shown is the user’s own gateway
  - Hitting Leave shows a modal with information. User has to type “LEAVE NETWORK” before Leave Network button is enabled.
  - Hitting Leave Network button initiates signature request and then a success message.
  - Site is refreshed after leaving.
- Release version shown on sidebar

### Changed

- Gateway Details: rename “Reward Ratios” to “Performance Ratios”
- Gateway Details: Fixes text bubble cut off when copying wallet address

### Fixed

- Gateway Details: Remove Edit and Stake Buttons from gateways that are leaving

## [1.0.0]

- Initial versions of application; version was bumped to 1.1.0 for first public versioned release.
