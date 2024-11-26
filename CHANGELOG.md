# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added 

* Download buttons added to Reports page and individual Report page 
* Observers: Added epoch selector to view prescribed observers for previous epochs
* Gateway Details Page
  * Reported On By card: text links to gateway for observer, report button links to report 
  * Reported On card: Report button shows in header that links to that report's page 

### Updated

* Staking and Withdrawal modals updated to show Review page for user to confirm operation before processing
* Withdrawal Modal: Added option for Standard and Expedited Withdrawal
* Modal dialog styles refreshed


## [1.4.2] - 2024-11-20

### Updated

* Show error message toast if the application is unable to retrieve the current epoch

## [1.4.1] - 2024-11-18

### Updated

* Optimized loading of user stakes and pending withdrawals. 

### Fixed

* Gateways count in site header should only count active gateways.

## [1.4.0] - 2024-11-14

### Added

* View Pending Withdrawals on Staking page and support cancelling pending withdrawals as well as performing expedited withdrawals
* View Changelog in app by clicking version number in sidebar

### Updated

* Staking page top cards now show balance, amount staking + pending withdrawals, and rewards earned last 14 epochs and last epoch

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