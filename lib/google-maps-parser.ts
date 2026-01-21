export interface ParsedLocation {
  latitude: number
  longitude: number
  address?: string
}

export function parseGoogleMapsUrl(url: string): ParsedLocation | null {
  try {
    // Google Maps URL formatları:
    // https://www.google.com/maps/place/Address/@LAT,LNG,17z/...
    // https://www.google.com/maps/@LAT,LNG,17z
    // https://maps.google.com/?q=LAT,LNG
    // https://goo.gl/maps/...

    // @ işaretinden sonraki koordinatları bul
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      return {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2]),
      }
    }

    // ?q= parametresindeki koordinatları bul
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (qMatch) {
      return {
        latitude: parseFloat(qMatch[1]),
        longitude: parseFloat(qMatch[2]),
      }
    }

    // /maps/place/ formatı
    const placeMatch = url.match(/\/maps\/place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (placeMatch) {
      return {
        latitude: parseFloat(placeMatch[1]),
        longitude: parseFloat(placeMatch[2]),
      }
    }

    return null
  } catch (error) {
    console.error('Google Maps URL parse hatası:', error)
    return null
  }
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

