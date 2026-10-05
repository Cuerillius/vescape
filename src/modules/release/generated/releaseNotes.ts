import type { BundledReleaseNote } from '../lib/releaseNotes'

export const bundledReleaseNotes = [
  {
    version: '0.98.0',
    markdown:
      '## Watch\r\n\r\n- Group Ride comes to Apple Watch and Wear OS, with indicators for other riders\' low board batteries and high motor or controller temperatures. See riders on the map, locate those beyond its edge, and browse a list showing their direction and distance. Works without a connected board.\r\n- When no board is connected, gauges show empty readings without a "Board not connected" notice. Apple Watch navigation also stays fully visible instead of dimming as though updates had stopped.\r\n- On Apple Watch, swiping sideways from Remote Tilt now follows your finger and settles onto the next page or back into place.\r\n',
  },
  {
    version: '0.97.3',
    markdown:
      '## Improved\r\n\r\n- Ride history maps now hide pause, connection, error, and gap markers by default. Turn on "Ride markers on map" in Settings → Diagnostics to show them.\r\n\r\n## Fixed\r\n\r\n- Fixed the live map trail disappearing when connecting, switching, or disconnecting a board, and after returning to the app. Your phone\'s location continues updating independently of the board connection.\r\n',
  },
  {
    version: '0.97.2',
    markdown:
      "## Improved\r\n\r\n- Group Ride now remembers your Auto setting between app sessions. When enabled, it joins the nearest public group ride or starts one once your board is connected and your location is available. Leaving a ride turns Auto off so you won't automatically rejoin.\r\n",
  },
  {
    version: '0.97.1',
    markdown:
      '## Watch\r\n\r\n- Fixed sideways swipes getting stuck on the Remote Tilt page on Apple Watch.\r\n- Remote Tilt now defaults to 20% per second instead of 10% on Apple Watch and Wear OS, making adjustments faster. Your saved speed setting is preserved.\r\n',
  },
  {
    version: '0.97.0',
    markdown:
      '## New\r\n\r\n- Turn on the Group Ride switch to automatically join the nearest public ride within 10 km, or create one if none is nearby. Turn it off to leave.\r\n',
  },
  {
    version: '0.96.0',
    markdown:
      "## Fixed\r\n\r\n- Fixed hard-to-read dropdown options in light theme, with clearer selected choices and switch states.\r\n\r\n## Watch\r\n\r\n- Added Remote Tilt control on Apple Watch and Wear OS. Drag up or down to adjust tilt, release to hold it, and double-tap to ease back to neutral. Tilt stays set when the watch sleeps or disconnects. The gauges show active tilt, and Board Move warns when moving will clear it. Adjust the stick's speed in Watch settings on your phone.\r\n",
  },
  {
    version: '0.95.2',
    markdown:
      "## New\r\n\r\n- Added a Molicel P42A cell preset for configuring your board's battery.\r\n",
  },
  {
    version: '0.95.1',
    markdown:
      '## Improved\r\n\r\n- Board light switches now show when their state is unknown, and accessory switches show a spinner while saving changes.\r\n- Open Sounds directly from the settings drawer to choose and preview a sound pack.\r\n\r\n## Fixed\r\n\r\n- Speed alert presets now recalculate to whole-number thresholds when you switch between km/h and mph, with active alerts updating immediately. Custom alert thresholds stay unchanged.\r\n',
  },
  {
    version: '0.95.0',
    markdown:
      "## New\r\n\r\n- Choose Alarm or Media audio output on Android for alerts, spoken warnings, and app sounds.\r\n- Switch to imperial units for mph, miles, and feet across live readings, ride history, navigation, and spoken speed alerts. Saved alert thresholds keep the same physical meaning.\r\n- Export rides and Favorites as GPX routes or CSV telemetry files.\r\n- Choose Retro or Classic app sounds, or build custom packs from WAV files for connection, error, and Group Ride cues. Custom packs are included in backups.\r\n\r\n## Improved\r\n\r\n- Tune editing now supports precise manual entry alongside the ruler, with warnings for values outside the usual range.\r\n- Changing map style now preserves your app appearance preference.\r\n- Ride and Favorite thumbnails show more route detail, preserve proportions, and leave gaps where GPS data is missing.\r\n\r\n## Fixed\r\n\r\n- Board-matched alert presets recover missing rules once configuration becomes available. Alert markers and previews now reflect the saved thresholds used during rides.\r\n- Applying an unchanged tune value no longer rounds it or overwrites custom linked settings. ATR Speed Boost now displays and edits the correct percentage.\r\n- Tune profiles remain available after Refloat patch updates within the same major and minor version.\r\n- Fixed app launch on iOS 27.\r\n\r\n## Watch\r\n\r\n- Apple Watch and Wear OS follow the phone's unit preference for speed, navigation distance, and radar distance labels.\r\n",
  },
  {
    version: '0.94.0',
    markdown:
      '## Fixed\r\n\r\n- Fixed an app error when saved sign-in credentials temporarily cannot be read.\r\n- Fixed hard-to-read disabled buttons in light mode and GPS status colors that did not update when switching themes.\r\n\r\n## Watch\r\n\r\n- Added Apple Watch support with live speed, duty cycle, battery and temperature gauges, plus your route, distance to destination, weather forecast and rain radar. You can also control board lights and hold to move the board from your wrist. Move stops when you release or the connection is lost. Open Vescape on the watch manually to get started.\r\n- Adjusted the Wear OS weather layout to keep the forecast and sunrise or sunset time visible on smaller screens.\r\n',
  },
  {
    version: '0.93.0',
    markdown:
      '## New\r\n\r\n- Added support for compatible Bluetooth accessories, including ground-clearance sensors for automatic tilt adjustment and brake lights with adjustable sensitivity and parked behavior.\r\n- Remote Tilt is now available on iOS, including tilt lock and timed return to neutral.\r\n- Added linking support for older Float and Refloat boards, including controllers running VESC 6.02.\r\n\r\n## Improved\r\n\r\n- Speed alerts now use a different sound from duty-cycle alerts, making them easier to tell apart while riding.\r\n- Ride routes continue recording through brief board disconnects without splitting the ride. Recording pauses when the board disengages and resumes when you ride again.\r\n- GPS now switches off in the background when neither riding nor sharing your Group Ride location needs it.\r\n- The board selector puts your active board first, with direct access to warnings, VESC faults and editing.\r\n\r\n## Fixed\r\n\r\n- Remote Tilt handles delayed responses more reliably, preventing older drag commands from overriding a release or cancel and keeping the return countdown steady.\r\n- Storage failures now show clear errors instead of appearing to save successfully. Recording stops with a visible warning if ride data cannot be saved.\r\n- Reconnecting no longer restarts recording after you explicitly stop it.\r\n',
  },
  {
    version: '0.92.1',
    markdown:
      '## Fixed\r\n\r\n- Fixed ride recording on iOS so new rides save correctly and appear in ride history.\r\n\r\n## Watch\r\n\r\n- Wear OS always-on mode now keeps the full gauge layout visible, including battery and motor/controller temperatures, with readings refreshing every 10 seconds. Speed and duty are dimmed to indicate delayed readings, and stale telemetry clears instead of leaving frozen values on screen. Low battery keeps its warning color on supported displays.\r\n- Clearer connection messages distinguish a disconnected phone, a missing or outdated phone app, and a disconnected board, with guidance on what to do next.\r\n',
  },
  {
    version: '0.92.0',
    markdown:
      '## New\r\n\r\n- View animated rain radar on your watch, centered around your location with 50 km and 100 km range guides and a timeline of the last two hours.\r\n- Control your board’s lights and headlight independently from your watch on compatible Refloat firmware.\r\n- A status below the live gauges now clearly shows when GPS is starting, searching, weak, lost, off, or blocked, with quick access to navigation diagnostics.\r\n\r\n## Improved\r\n\r\n- Speed, duty, battery, and temperature gauges now stay pinned around the watch face while you use weather, navigation, Board Move, light controls, or diagnostics.\r\n- Rain radar in the app now adds labeled range rings, frames the full 100 km view, and resumes playback after you scrub the timeline.\r\n\r\n## Fixed\r\n\r\n- On iPhone, GPS now continues after a board disconnect and remembers your last precise location between app launches.\r\n',
  },
  {
    version: '0.91.1',
    markdown:
      '## Improved\r\n\r\n- The event log now gives clearer details when GPS updates stop, lose signal, recover, or fail because of permissions or provider errors.\r\n\r\n## Fixed\r\n\r\n- Fixed a crash that could occur when live ride and battery readouts used adaptive theme colors.\r\n',
  },
  {
    version: '0.91.0',
    markdown:
      '## New\r\n\r\n- Vescape now records VESC controller faults for each Board, with telemetry from up to five seconds before detection through two seconds after the fault clears. Review or dismiss each occurrence and read the controller fault log while the Board is connected and stopped.\r\n- Control board lights and the headlight independently from the Board drawer on compatible Refloat firmware.\r\n\r\n## Improved\r\n\r\n- Ride History now stays tied to the Board instead of its BLE address. Renaming a Board relabels past rides, while deleting a Board keeps its Ride History and Tune Profiles.\r\n- Expandable controls now open in a focused panel without shifting the drawer. Tap or drag the backdrop to close it.\r\n\r\n## Fixed\r\n\r\n- Vescape no longer warns that "Disable Moving Faults" is unsafe, since riders may deliberately use it with unreliable footpad sensors.\r\n- Live BMS cell-voltage and balancing trends now decode correctly.\r\n- The footpad indicator now matches the Board\'s physical left and right sensor zones, and both rails glow when either sensor engages in Posi mode.\r\n- Map light and dark changes now persist, and widget borders use the correct theme colors on iOS.\r\n',
  },
  {
    version: '0.90.0',
    markdown:
      "## New\r\n\r\n- Choose light, dark, system, or automatic sunrise and sunset themes. Maps, charts, controls, and navigation now adapt with the app.\r\n- Vescape now reads your board's Refloat and motor configuration during linking. Relevant pushback, cutoff, current, temperature, and footpad settings appear beside live telemetry, and Vescape reports changes made outside the app.\r\n- Duty, motor temperature, and controller temperature alert presets can now follow the board's own protection settings.\r\n- Active navigation now stays accessible in a compact sheet with remaining distance, ride time, and a quick cancel action.\r\n\r\n## Improved\r\n\r\n- Tune opens with the board's last known values while the latest configuration is being read.\r\n- The dashboard footpad indicator now shows both sensor zones against their real engagement voltages. The telemetry strip also fits better on smaller screens.\r\n- Cell voltage spread warnings now trigger at 0.20 V and become critical at 0.50 V, reducing premature warnings.\r\n- Group Ride discovery now finds nearby riders within 40 km.\r\n\r\n## Fixed\r\n\r\n- Fixed an iPhone crash that could occur while stopping or changing alert audio.\r\n- Board linking now retries interrupted integrity checks, times out cleanly when a link cannot be proven, and shows the actual reason linking was blocked.\r\n- Map style changes no longer leave a blank map or stuck spinner, and they preserve the camera position. Compass, pinch, and preview-pan transitions also keep the expected orientation.\r\n- Database restore now opens the file picker before confirmation and restores the selected backup correctly.\r\n",
  },
  {
    version: '0.89.2',
    markdown:
      '## Improved\r\n\r\n- Compass-follow mode is smoother and more reliable during long rides, with less background processing.\r\n- Mapy maps now use sharper, high-resolution tiles.\r\n\r\n## Fixed\r\n\r\n- Satellite imagery brightness and saturation settings now apply correctly on iOS.\r\n',
  },
  {
    version: '0.89.1',
    markdown:
      '## Fixed\r\n\r\n- Ride History now shows rides still in progress and refreshes them while the list is open. Active rides end at “now,” and your selected ride stays current as new data arrives.\r\n',
  },
  {
    version: '0.89.0',
    markdown:
      '## New\r\n\r\n- History now opens with an overview of your riding stats, recent rides, favorites, and route previews, with quick access to complete ride lists.\r\n- Group Ride now works on iPhone with live rider positions, roster updates, reconnection, and background continuity during active rides.\r\n\r\n## Improved\r\n\r\n- Alert presets now explain what you’ll hear at each level and make it easier to preview alert sounds before riding.\r\n- Ride History now loads complete rides in reliable pages, keeping long histories and profile stats consistent.\r\n- Auto-connect on iPhone now starts when Vescape launches and avoids duplicate connections when restoring an active session.\r\n\r\n## Fixed\r\n\r\n- Board Move now runs steadily instead of pulsing on boards using Refloat 1.0–1.2.\r\n- Opening a ride or favorite from History now selects the correct item, and favorite route thumbnails render reliably.\r\n- Compass heading on iPhone now points in the correct direction and stays stable during rides; off-screen map indicators no longer twitch in compass mode.\r\n- Weather radar now opens near current conditions and displays consistent 24-hour times.\r\n',
  },
  {
    version: '0.88.2',
    markdown:
      '## Fixed\r\n\r\n- Pushback voltage warnings now correctly handle legacy pack-voltage values on newer firmware, preventing false safety alerts.\r\n- Pinch-to-zoom no longer accidentally reveals the map, and map gestures remain responsive as the first GPS fix arrives.\r\n- The compass direction arrow now remains visible when GPS accuracy is approximate.\r\n',
  },
  {
    version: '0.88.1',
    markdown:
      '## Improved\r\n\r\n- Live telemetry charts now keep related readings synchronized while zooming and scrubbing, making battery, footpad, and IMU data easier to compare at the same moment.\r\n- Empty telemetry readouts now show their units and hide unavailable maximums, making disconnected screens easier to understand.\r\n\r\n## Fixed\r\n\r\n- Bottom drawers now stay fully visible when their content changes and remain stable during drag gestures.\r\n- Chart scrubbing now reports the closest recorded value when telemetry samples are sparse.\r\n',
  },
  {
    version: '0.88.0',
    markdown:
      '## New\r\n\r\n- Explore recorded rides with zoomable, scrubbable charts that stay in sync with the map and ride statistics. A new full-screen view shows every metric together, while favorites, GPS gaps, and selected ranges remain clearly marked.\r\n- Choose any linked boards that should automatically start Vescape when powered on, with a configurable quiet period after closing the app.\r\n\r\n## Improved\r\n\r\n- Active rides on iPhone are more resilient in the background: Vescape can restore an interrupted board connection, resume recording, and preserve the latest buffered telemetry.\r\n- Live metric detail charts now show full-resolution data, including their time coverage and sample rate.\r\n\r\n## Fixed\r\n\r\n- GPS recording on iPhone now starts immediately after first-time location permission is granted, without requiring a restart, and stale locations are no longer written into ride telemetry.\r\n- The iPhone Live Activity now clearly shows when it has lost contact with Vescape instead of continuing to display outdated ride data.\r\n',
  },
  {
    version: '0.87.0',
    markdown:
      '## New\r\n\r\n- Move a disengaged board forward or backward from your phone or Wear OS watch with hold-to-move controls. Choose the strength; releasing stops immediately, and wrist movement stops automatically if commands are interrupted.\r\n- Plan a route from your live position to a map destination, choose paths, cycleways, or roads, and review its distance and duration before riding. Follow remaining distance on your phone, with the route and optional direction arrow mirrored to Wear OS.\r\n- View current conditions and an hourly forecast on Wear OS, including rain chances and sunrise and sunset times.\r\n- Stop an active ride directly from the iOS Lock Screen or expanded Dynamic Island after authentication.\r\n- Open account status, updates, storage, and frequently used settings from the new ride-screen Settings drawer.\r\n- Choose how long a stop must last before Vescape splits a ride; changing it also regroups past rides.\r\n\r\n## Improved\r\n\r\n- Alerts now re-arm only after telemetry returns to a safe margin, preventing repeated warnings near a threshold. Each rule can repeat at a chosen interval or use one to five beeps, while sustained warning ranges are clearer on gauges.\r\n- Live gauges now scale speed to the active board’s top speed and extend temperature scales to 100°C.\r\n- The Wear OS mirror uses less battery during long rides by entering ambient mode and reducing unnecessary phone-link work.\r\n- Map search now favors nearby results and uses icons that better match each place, while enabled privacy zones appear directly on the map.\r\n- Tune now presents Basic settings first and keeps Tune Preview and advanced values hidden until requested.\r\n\r\n## Fixed\r\n\r\n- Board scans on iOS now continue when system UI briefly makes the app inactive instead of stopping before the board appears.\r\n',
  },
  {
    version: '0.86.0',
    markdown:
      '## New\r\n\r\n- Move your board forward or backward from Board Settings with hold-to-move controls, adjustable strength, trusted-link checks, and an immediate stop on release.\r\n- Open a new Settings drawer from the ride screen for quick access to account status, app updates, storage, and frequently used settings.\r\n- Choose how long a stop must be before Vescape splits a ride; changes also regroup past rides.\r\n\r\n## Improved\r\n\r\n- Alerts now re-arm only after telemetry returns to a safe margin, preventing repeated warnings near a threshold. Alerts can also repeat at a chosen interval, use one to five beeps, and clearly show sustained warning ranges on gauges.\r\n- Temperature presets now better reflect motor and controller limits, with repeating warnings near critical temperatures and gauges extending to 100°C.\r\n\r\n## Fixed\r\n\r\n- Legal Mode errors remain visible while the modal closes, giving you enough time to read what went wrong.\r\n- Drawers now dismiss with a smoother, more consistent fade.\r\n',
  },
  {
    version: '0.85.1',
    markdown:
      '## Fixed\r\n\r\n- On Android, direct board connections now restore live telemetry after an automatic reconnect instead of getting stuck waiting for data.\r\n- Map recentering and focus controls now reliably stop existing fling momentum and hold the intended view.\r\n- iOS can now restore Android backups without losing access to saved boards and ride history.\r\n',
  },
  {
    version: '0.85.0',
    markdown:
      '## Improved\r\n\r\n- Automatic ride recording is now enabled by default for new setups.\r\n- Map movement is smoother when following your ride, dragging to reveal the map, recentering, focusing on riders or points, and viewing ride history.\r\n\r\n## Fixed\r\n\r\n- Live telemetry readouts no longer disappear on iOS or cause rapid-update failures on Android.\r\n- The Android board notification now stays in sync through stale telemetry, reconnection, errors, and disconnects. It no longer shows old values and keeps Disconnect available during recovery.\r\n- Map movement no longer overshoots or vibrates after dragging to reveal the map.\r\n',
  },
  {
    version: '0.84.2',
    markdown:
      '## Fixed\r\n\r\n- The Wear OS splash screen now shows the complete Vescape logo on a black background.\r\n',
  },
  {
    version: '0.84.0',
    markdown:
      '## New\r\n\r\n- Test your alert setup before a ride. Vescape sweeps a simulated gauge through active thresholds, plays the real sounds or spoken messages, and marks thresholds on the chart without affecting saved rules or live board alerts.\r\n- View release notes for installed versions anytime from Settings.\r\n\r\n## Improved\r\n\r\n- Motor and battery current charts now cover the full ±300 A alert range, keeping higher readings and alert thresholds visible.\r\n\r\n## Fixed\r\n\r\n- Vescape now launches and connects to boards correctly on Android 11 and 12.\r\n- Tune Profiles now clearly explain missing or unsupported Refloat versions, and Retry re-reads the connected board.\r\n- Edge drawers now finish closing reliably when another gesture interrupts the animation.\r\n- The Wear OS splash screen now shows the complete Vescape logo on a black background.\r\n',
  },
  {
    version: '0.83.1',
    markdown:
      "## Fixed\r\n\r\n- Legal Mode's European guidance was re-audited, correcting road status and speed references for Bulgaria, Czechia, Iceland, and Malta while updating route, equipment, age, helmet, power, registration, and insurance rules across the catalog.\r\n- Tune Profiles now support two-part Refloat versions such as 1.1, allowing the first profile to be created correctly.\r\n",
  },
  {
    version: '0.83.0',
    markdown:
      '## New\r\n\r\n- Save any section of a ride as a named Favorite by trimming its chart. Favorites keep exact stats and routes, protect their telemetry from history deletion, and can hold imported photos and videos.\r\n\r\n## Fixed\r\n\r\n- Ride History charts now show their actual local start and end times instead of relative live-chart labels.\r\n- Ride and Favorites lists now open with the current selection in view.\r\n',
  },
  {
    version: '0.82.0',
    markdown:
      "## New\r\n\r\n- Shared Map Points let riders discover, filter, and navigate to nearby drops, bonks, nose slides, trail entries, viewpoints, and charging spots. Signed-in riders can contribute named points with descriptions, manage their own points, and vote on others' contributions.\r\n\r\n## Improved\r\n\r\n- Map navigation is more reliable, with steadier reveal movement, responsive destination markers, correctly updating map layers, and more dependable off-screen direction indicators.\r\n",
  },
  {
    version: '0.81.2',
    markdown:
      '## Improved\r\n\r\n- Group Ride identity controls now make editing your rider name and color clearer, with an expanded color selection.\r\n\r\n## Fixed\r\n\r\n- Tune History now reliably shows the newest entry first on Android when multiple changes occur within the same millisecond.\r\n',
  },
  {
    version: '0.81.1',
    markdown:
      '## Fixed\r\n\r\n- Telemetry charts with a secondary data series no longer crash when opened or scrubbed.\r\n',
  },
  {
    version: '0.81.0',
    markdown:
      '## New\r\n\r\n- Alert Presets provide Safe, Normal, Minimal, and Off protection levels for speed, duty, motor temperature, controller temperature, and battery. Individual metrics can still use custom alert rules.\r\n- Vescape can now show update notices, important announcements, and required-update guidance directly in the app.\r\n- Board Top Speed can be configured per board to scale speed gauges and preset alert thresholds appropriately.\r\n\r\n## Improved\r\n\r\n- Alerts are now stored separately for each board and can be configured during board setup or later in Board Settings.\r\n- Legal Mode is now enabled per board and enforced by the native riding service, so its speed warnings continue without relying on the app interface. Enabling it requires a connected board with a trusted link.\r\n',
  },
  {
    version: '0.80.2',
    markdown:
      '## New\r\n\r\n- Legal Mode can warn as you approach and exceed local speed limits, with jurisdiction guidance and a legal-limits map.\r\n- The map now has dedicated Explore, Weather, and Legal Limits views, including an animated, scrubbable weather-radar timeline.\r\n- Optional Vescape accounts let you sign in and manage your identity for online features while local riding features continue to work offline.\r\n\r\n## Improved\r\n\r\n- Satellite imagery now has adjustable opacity and smoother transitions, while weather navigation and map search behave more reliably.\r\n\r\n## Fixed\r\n\r\n- Fixed Legal Mode alert editing and several map issues involving satellite layers, weather positioning, search results, and the navigation north indicator.\r\n',
  },
  {
    version: '0.80.0',
    markdown:
      '## New\r\n\r\n- Board Warnings now monitor for unsafe configuration and battery conditions, including disabled footpad sensing, late pushback thresholds, disabled moving-fault protection, excessive cell spread, and battery configuration mismatches. Warnings explain the risk and can be dismissed or restored.\r\n- A new Auto Close option can close Vescape after your board remains disconnected for a configurable time.\r\n\r\n## Improved\r\n\r\n- The Wear OS companion can now open automatically when your board connects, shows clearer live gauges and connection state, and includes on-watch diagnostics.\r\n- Ride History now provides a clearer empty state before your first recorded ride.\r\n',
  },
  {
    version: '0.79.0',
    markdown:
      "## New\r\n\r\n- Vescape now verifies your board's firmware, Refloat package, and BMS after connecting. Firmware commands remain blocked until the saved Board Link is trusted, and hardware or firmware changes prompt you to re-link.\r\n- Tune Preview lets you compare how Tune Profiles respond to speed, pitch, hills, and ATR before syncing them to your board.\r\n\r\n## Improved\r\n\r\n- Smart-BMS details now follow the ride scrubber and show peak cell spread, the worst cell group, balancing, and charging state.\r\n- Tune Profiles can now have their own icon and color, and are easier to select from the main screen.\r\n- Photos and videos added to a ride are now kept with that ride and remain available in its gallery and map without ongoing photo-library access.\r\n- Manually closing Vescape can now pause Auto Start, preventing the app from immediately reopening.\r\n\r\n## Fixed\r\n\r\n- Compass-follow navigation is available again with a smoother, more efficient map-rendering path.\r\n",
  },
  {
    version: '0.77.0',
    markdown:
      '## Improved\r\n\r\n- Smart-BMS cell groups now use horizontal, automatically scaled bars and three-decimal voltage readings, making small imbalances easier to compare. Minimum, average, maximum, and total spread are shown together.\r\n\r\n## Fixed\r\n\r\n- Android now validates permissions and connection settings before starting background board, GPS, auto-connect, or Group Ride work, preventing service-start failures and using the correct system mode for each activity.\r\n',
  },
  {
    version: '0.76.0',
    markdown:
      "## New\r\n\r\n- Vescape's core riding experience is now available on iPhone, including board connection, live telemetry, alerts, ride recording and history, privacy zones, Refloat tuning, and Tune Profiles.\r\n- iPhone riders can follow connection, battery, and fault status from a Live Activity on the Lock Screen and Dynamic Island. Board faults can also raise a notification while the app is backgrounded when notification access is enabled.\r\n- The Battery screen now includes detailed smart-BMS telemetry with cell voltages, balancing state, temperatures, health, humidity, current, and a shareable raw snapshot.\r\n\r\n## Improved\r\n\r\n- Board connections now keep retrying until the board returns instead of eventually giving up.\r\n- Battery percentage, voltage, and current charts now share a synchronized scrubber, making load-related voltage sag easier to inspect.\r\n- Vescape now uses the Raleway typeface throughout for clearer, more consistent text.\r\n- Map and Group Ride updates use less processing power. Compass-follow mode has been temporarily disabled to prevent excessive battery use and device heating.\r\n\r\n## Fixed\r\n\r\n- Fixed Tune data sometimes remaining stale after reconnecting or returning to the app.\r\n- Fixed duplicate or outdated ride-status notifications and Live Activities.\r\n- Fixed map pins rendering incorrectly on iPhone.\r\n- Native changes such as updated settings and saved battery readings now appear without restarting the app.\r\n",
  },
  {
    version: '0.75.0',
    markdown:
      '## Improved\r\n\r\n- The battery gauge now remembers the last reading while disconnected and shows its age when it is over an hour old.\r\n- Tune differences now offer clear "Update tune" and "Send to board" actions, and the connected board\'s Refloat version is shown alongside its firmware details.\r\n\r\n## Fixed\r\n\r\n- Fixed Refloat tune writes that could fail because required package information was missing.\r\n- Group Ride heading arrows now point in the correct direction.\r\n',
  },
  {
    version: '0.74.0',
    markdown:
      "## Improved\r\n\r\n- Social and Tune panels now open as smooth, full-width edge drawers that scroll naturally and can be dismissed with a swipe or fling.\r\n- Direction markers now match your chosen rider color, including when shown at the edge of the map.\r\n\r\n## Fixed\r\n\r\n- Tune dials no longer conflict with the editor's dismiss gesture, keeping horizontal adjustments responsive.\r\n",
  },
  {
    version: '0.73.0',
    markdown:
      '## New\r\n\r\n- Group Rides now share each rider’s map target, shown as a color-matched pin and off-screen indicator.\r\n\r\n## Improved\r\n\r\n- Off-screen riders now appear along the map edge; tap an indicator to jump to that rider.\r\n\r\n## Fixed\r\n\r\n- Focusing on a rider no longer repeatedly snaps the map back as their position updates.\r\n',
  },
  {
    version: '0.72.0',
    markdown:
      '## Improved\r\n\r\n- Ride History now frames an early route preview while full ride details load, then smoothly refines to the complete route.\r\n- Your selected rider color now carries through to your live map position and trail.\r\n- Phone-heading movement is steadier, and approximate locations no longer show a misleading direction arrow.\r\n\r\n## Fixed\r\n\r\n- Pinch zoom momentum now continues while map perspective adjusts, and touching the map stops competing camera motion.\r\n',
  },
  {
    version: '0.71.0',
    markdown:
      '## Improved\r\n\r\n- Compass follow now waits for a valid heading and remains active through centered zoom and rotation gestures.\r\n- Weather opens in a consistent flat, north-up overview.\r\n\r\n## Fixed\r\n\r\n- Group Rides now connect to the live service in release builds, while create and join controls wait until the connection is ready.\r\n- Ride History no longer recenters the map over manual inspection when detailed route data finishes loading.\r\n',
  },
  {
    version: '0.70.0',
    markdown:
      '## New\r\n\r\n- Group Ride riders now leave recent trails on the live map, making it easier to see where the group is moving.\r\n\r\n## Improved\r\n\r\n- Group Ride rosters highlight low board battery and high motor or controller temperatures with warning and critical colors.\r\n\r\n## Fixed\r\n\r\n- Stationary Group Ride members no longer incorrectly appear stale while still connected.\r\n',
  },
  {
    version: '0.69.0',
    markdown:
      '## Improved\r\n\r\n- Group Ride rosters now include your own rider and show live speed, board battery, motor and controller temperatures, and phone battery for each rider.\r\n- Automatic idle pauses now wait three minutes, avoiding pauses during short stops.\r\n- The board selector now shows the telemetry rate currently sustained by the connection.\r\n\r\n## Fixed\r\n\r\n- Automatic idle pauses now appear with a clear marker and label in Ride History.\r\n',
  },
  {
    version: '0.68.0',
    markdown:
      '## New\r\n\r\n- Android riders can create or join nearby Group Rides, see live rider locations and board status on the map, and keep their location private inside enabled Privacy Zones.\r\n- Profile stats now show all-time and monthly distance, ride count, ride time, speeds, longest ride, and battery energy totals.\r\n\r\n## Improved\r\n\r\n- Ride Recording automatically pauses while idle and resumes as soon as you start moving again, with a clear paused state on the recording control.\r\n\r\n## Fixed\r\n\r\n- Android auto-start rides can now retain their GPS track in the background, with guidance for granting the required location permission.\r\n',
  },
  {
    version: '0.67.0',
    markdown:
      '## Improved\r\n\r\n- Active ride recordings now pause after 30 seconds without movement, reducing battery use and unnecessary history growth. Recording resumes with the first moving sample, and the record control clearly shows when it is paused.\r\n\r\n## Fixed\r\n\r\n- Long-press menus for Tune Profiles and Privacy Zones no longer also switch the selected item when released.\r\n- Floating controls on Android now contain touch ripples within their rounded edges.\r\n',
  },
  {
    version: '0.66.0',
    markdown:
      '## New\r\n\r\n- A new Wear OS companion mirrors live speed, duty cycle, battery level, and motor and controller temperatures. It clearly dims stale readings, reports disconnections, and keeps the display awake during live telemetry.\r\n\r\n## Improved\r\n\r\n- Ride History charts now scrub smoothly and stay synchronized with each other and the position marker on the map.\r\n- New ride recordings use less storage while preserving accurate totals, averages, energy, and peak values. Ride stats now also show the recorded point count.\r\n',
  },
  {
    version: '0.65.0',
    markdown:
      '## New\r\n\r\n- On Android 12 and newer, Auto Start can wake Vescape in the background and connect when your selected board is detected nearby.\r\n- The Android board notification now provides Connect and Disconnect controls.\r\n\r\n## Improved\r\n\r\n- Auto Start, Auto Connect, automatic recording, and connection sounds are now grouped on a dedicated Connection settings screen.\r\n',
  },
  {
    version: '0.64.0',
    markdown:
      "## Fixed\r\n\r\n- Disconnecting from a board on Android no longer risks crashing Vescape's background service.\r\n",
  },
  {
    version: '0.63.0',
    markdown:
      '## Fixed\r\n\r\n- Restoring a database backup now reloads Vescape so saved boards, settings, and ride history appear correctly.\r\n',
  },
] as const satisfies readonly BundledReleaseNote[]
