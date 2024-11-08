# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* View Pending Withdrawals on Staking page and support cancelling pending withdrawals as well as performing expedited withdrawals.
* View Changelog in app by clicking version number in sidebar

### Changed

* Updated header style of cards
* Observations: Updated to use arweave.net for reference domain when generating observation report
* Observe: Default to using prescribed names 

## [1.3.0] - 2024-10-21

### Added

* New Dashboard home page that visualizes data for the state of the gateway network 

## [1.2.0] - 2024-10-17

### Added

* “Reported On” and “Reported On By” cards on Gateway Details page for viewing observation status by epoch for a gateway
* “Software” card on gateway details page that shows gateway software version and available bundlers (if gateway has listed them)

### Changed

* Updated Gateway Details page for leaving gateways to hide non-relevant cards and show leave date


## [1.1.0] - 2024-10-08

### Added

* Gateways > Reports: Add “AR.IOEpoch #” Column
* Gateways>Reports>Individual Reports
  * Add Epoch #
  * Remove Epoch start height
* Implemented Leave Network Flow:
  * Adds button to Gateway Detail page to leave network when gateway shown is the user’s own gateway
  * Hitting Leave shows a modal with information. User has to type “LEAVE NETWORK” before Leave Network button is enabled.
  * Hitting Leave Network button initiates signature request and then a success message.
  * Site is refreshed after leaving.
* Release version shown on sidebar


### Changed

* Gateway Details: rename “Reward Ratios” to “Performance Ratios”
* Gateway Details: Fixes text bubble cut off when copying wallet address

### Fixed

* Gateway Details: Remove Edit and Stake Buttons from gateways that are leaving

## [1.0.0]

* Initial versions of application; version was bumped to 1.1.0 for first public versioned release. 
