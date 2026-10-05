import IconBinoculars from '@tabler/icons-react-native/IconBinoculars'
import IconChargingPile from '@tabler/icons-react-native/IconChargingPile'
import IconFlag from '@tabler/icons-react-native/IconFlag'
import IconTree from '@tabler/icons-react-native/IconTree'
import IconToolsKitchen2 from '@tabler/icons-react-native/IconToolsKitchen2'
import IconCoffee from '@tabler/icons-react-native/IconCoffee'
import IconBuildingStore from '@tabler/icons-react-native/IconBuildingStore'
import IconBed from '@tabler/icons-react-native/IconBed'
import IconFirstAidKit from '@tabler/icons-react-native/IconFirstAidKit'
import IconParking from '@tabler/icons-react-native/IconParking'
import IconSchool from '@tabler/icons-react-native/IconSchool'
import IconBuilding from '@tabler/icons-react-native/IconBuilding'
import IconBus from '@tabler/icons-react-native/IconBus'
import IconTrain from '@tabler/icons-react-native/IconTrain'
import IconPlane from '@tabler/icons-react-native/IconPlane'
import IconGasStation from '@tabler/icons-react-native/IconGasStation'
import IconBike from '@tabler/icons-react-native/IconBike'
import IconBuildingBank from '@tabler/icons-react-native/IconBuildingBank'
import IconBuildingChurch from '@tabler/icons-react-native/IconBuildingChurch'
import IconBarbell from '@tabler/icons-react-native/IconBarbell'
import IconBallFootball from '@tabler/icons-react-native/IconBallFootball'
import IconSwimming from '@tabler/icons-react-native/IconSwimming'
import IconCamera from '@tabler/icons-react-native/IconCamera'
import IconMapPin from '@tabler/icons-react-native/IconMapPin'

import {
  IconMapPointBonk,
  IconMapPointDrop,
  IconMapPointSlide,
  type MapMarkGlyph,
} from '@/modules/map-points/components/MapPointTablerIcons'
import type { MapPinKind } from '@/modules/map-points/constants/mapPoints'
import {
  getPlaceCategoryIconKey,
  type PlaceCategoryIconKey,
} from '@/modules/map-points/constants/placeCategoryIcon'

const MAP_POINT_KIND_TABLER_ICONS: Record<MapPinKind, MapMarkGlyph> = {
  direction: IconMapPin,
  drop: IconMapPointDrop,
  bonk: IconMapPointBonk,
  nose_slide: IconMapPointSlide,
  trail_entry: IconFlag,
  viewpoint: IconBinoculars,
  charging: IconChargingPile,
}

/** The Tabler glyph for each Map Point kind. */
export function getMapPointKindTablerIcon(kind: MapPinKind) {
  return MAP_POINT_KIND_TABLER_ICONS[kind]
}

const PLACE_CATEGORY_TABLER_ICONS: Record<PlaceCategoryIconKey, MapMarkGlyph> = {
  nature: IconTree,
  food: IconToolsKitchen2,
  coffee: IconCoffee,
  shopping: IconBuildingStore,
  lodging: IconBed,
  health: IconFirstAidKit,
  parking: IconParking,
  school: IconSchool,
  university: IconBuilding,
  bus: IconBus,
  // Tabler has no tram glyph; trams and rail share the train.
  tram: IconTrain,
  rail: IconTrain,
  airport: IconPlane,
  fuel: IconGasStation,
  cycling: IconBike,
  finance: IconBuildingBank,
  worship: IconBuildingChurch,
  fitness: IconBarbell,
  sports: IconBallFootball,
  swimming: IconSwimming,
  scenic: IconCamera,
  place: IconMapPin,
}

/** Maps Mapbox's free-form place category onto the same Tabler family as Vescape Map Points. */
export function getPlaceCategoryTablerIcon(category: string | null) {
  return PLACE_CATEGORY_TABLER_ICONS[getPlaceCategoryIconKey(category)]
}
