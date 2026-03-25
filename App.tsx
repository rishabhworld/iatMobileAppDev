import { useState, useEffect, useRef } from 'react'
import { View, Text, Button, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native'

let AsyncStorage: any = null

const ALL_REGIONS = [
  'Sydney',
  'Blue Mountains',
  'Riverina',
  'Central NSW',
  'North Coast NSW',
  'South Coast',
  'New England North West',
  'Far West NSW',
  'Northern NSW',
  'Hunter',
  'Illawarra',
  'Newcastle',
  'Rest of NSW',
  'South West NSW',
  'North West NSW',
  'Central West NSW',
  'Central Coast',
]

const REGION_KEY = 'nswHazardRegions'
const STREET_KEY = 'nswHazardStreets'
const INCIDENT_KEY = 'nswHazardIncidents'


export default function App() {
  // basic app states
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  // modal and dropdown open/close
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [regionDropdownVisible, setRegionDropdownVisible] = useState(false)

  // search text inside filter UI
  const [regionSearch, setRegionSearch] = useState('')
  const [streetSearch, setStreetSearch] = useState('')
  const [incidentSearch, setIncidentSearch] = useState('')

  // selected values from filter lists
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedStreet, setSelectedStreet] = useState('')
  const [selectedIncident, setSelectedIncident] = useState('')

  // active values currently applied to API filtering
  const [activeRegion, setActiveRegion] = useState('')
  const [activeStreet, setActiveStreet] = useState('')
  const [activeIncident, setActiveIncident] = useState('')

  // options shown in dropdown lists
  const [regionOptions, setRegionOptions] = useState<string[]>(ALL_REGIONS)
  const [streetOptions, setStreetOptions] = useState<string[]>([])
  const [incidentOptions, setIncidentOptions] = useState<string[]>([])

  // fallback storage when AsyncStorage package is not available
  const inMemoryStorageRef = useRef<Record<string, string>>({})


  // save region options
  const saveRegionOptions = async (regions: string[]) => {
    try {
      if (AsyncStorage?.setItem) {
        await AsyncStorage.setItem(REGION_KEY, JSON.stringify(regions))
      } else {
        inMemoryStorageRef.current[REGION_KEY] = JSON.stringify(regions)
      }
    } catch (err) {
      console.warn('Failed to save region options', err)
    }
  }

  // load region options
  const loadRegionOptions = async () => {
    try {
      const item = AsyncStorage?.getItem
        ? await AsyncStorage.getItem(REGION_KEY)
        : inMemoryStorageRef.current[REGION_KEY] || null
      if (!item) return
      const parsed = JSON.parse(item)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRegionOptions(parsed)
      }
    } catch (err) {
      console.warn('Failed to read region options', err)
    }
  }

  // make clean unique region list from API data
  const getUniqueRegions = (features: any[]): string[] => {
    const set = new Set<string>()
    features.forEach((feature) => {
      const roads = feature?.properties?.roads || []
      roads.forEach((road: any) => {
        const region = road.region?.trim()
        if (region) set.add(region)
      })
    })
    const arr = Array.from(set).sort()
    return arr.length ? arr : ALL_REGIONS
  }

  // make clean unique street list from API data
  const getUniqueStreets = (features: any[]): string[] => {
    const set = new Set<string>()
    features.forEach((feature) => {
      const roads = feature?.properties?.roads || []
      roads.forEach((road: any) => {
        const street = road.mainStreet?.trim() || road.crossStreet?.trim()
        if (street) set.add(street)
      })
    })
    const arr = Array.from(set).sort()
    return arr
  }

  // make clean unique incident kind list from API data
  const getUniqueIncidents = (features: any[]): string[] => {
    const set = new Set<string>()
    features.forEach((feature) => {
      const incident = feature?.properties?.incidentKind?.trim()
      if (incident) set.add(incident)
    })
    return Array.from(set).sort()
  }

  // save street options
  const saveStreetOptions = async (streets: string[]) => {
    try {
      if (AsyncStorage?.setItem) {
        await AsyncStorage.setItem(STREET_KEY, JSON.stringify(streets))
      } else {
        inMemoryStorageRef.current[STREET_KEY] = JSON.stringify(streets)
      }
    } catch (err) {
      console.warn('Failed to save street options', err)
    }
  }

  // load street options
  const loadStreetOptions = async () => {
    try {
      const item = AsyncStorage?.getItem
        ? await AsyncStorage.getItem(STREET_KEY)
        : inMemoryStorageRef.current[STREET_KEY] || null
      if (!item) return
      const parsed = JSON.parse(item)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setStreetOptions(parsed)
      }
    } catch (err) {
      console.warn('Failed to read street options', err)
    }
  }

  // save incident options
  const saveIncidentOptions = async (incidents: string[]) => {
    try {
      if (AsyncStorage?.setItem) {
        await AsyncStorage.setItem(INCIDENT_KEY, JSON.stringify(incidents))
      } else {
        inMemoryStorageRef.current[INCIDENT_KEY] = JSON.stringify(incidents)
      }
    } catch (err) {
      console.warn('Failed to save incident options', err)
    }
  }

  // load incident options
  const loadIncidentOptions = async () => {
    try {
      const item = AsyncStorage?.getItem
        ? await AsyncStorage.getItem(INCIDENT_KEY)
        : inMemoryStorageRef.current[INCIDENT_KEY] || null
      if (!item) return
      const parsed = JSON.parse(item)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setIncidentOptions(parsed)
      }
    } catch (err) {
      console.warn('Failed to read incident options', err)
    }
  }

  // main API call + filtering logic
  const fetchData = async (region: string = '', street: string = '', incident: string = '') => {
    setLoading(true)
    setError(null)
    setDebugInfo('Fetching data...')
    setActiveRegion(region)
    setActiveStreet(street)
    setActiveIncident(incident)

    const controller = new AbortController()
    const timeoutMs = 15000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch('https://api.transport.nsw.gov.au/v1/live/hazards/incident/all', {
        signal: controller.signal,
        headers: {
          Authorization:
            'apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJrczBrSG41SWFXVFktV2xlb0w1bG1rTnRsb2IyamIzVmlNY0hyc0dzSnZNIiwiaWF0IjoxNzc0NDAzMzQzfQ.U68gHLwMv4btFtrfiu_GJkr0i4qvhKaKMSKuAoNG1mM',
          'Cache-Control': 'no-cache',
          Accept: '*/*',
        },
      })
      clearTimeout(timeoutId)

      const statusCode = response.status
      const text = await response.text()
      const responseSize = text.length

      if (!response.ok) {
        throw new Error(`HTTP ${statusCode}`)
      }

      const parsed = JSON.parse(text)
      const allFeatures: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.features)
          ? parsed.features
          : []

      // update filter options from latest API response
      const freshRegions = getUniqueRegions(allFeatures)
      setRegionOptions(freshRegions)
      saveRegionOptions(freshRegions)

      const freshStreets = getUniqueStreets(allFeatures)
      setStreetOptions(freshStreets)
      saveStreetOptions(freshStreets)

      const freshIncidents = getUniqueIncidents(allFeatures)
      setIncidentOptions(freshIncidents)
      saveIncidentOptions(freshIncidents)

      let filtered = allFeatures

      // apply region filter
      if (region.trim()) {
        const queryRegion = region.trim().toLowerCase()
        filtered = filtered.filter((feature) => {
          const roads = feature?.properties?.roads || []
          return roads.some((road: any) =>
            road?.region?.toLowerCase().includes(queryRegion),
          )
        })
      }

      // apply street filter
      if (street.trim()) {
        const queryStreet = street.trim().toLowerCase()
        filtered = filtered.filter((feature) => {
          const roads = feature?.properties?.roads || []
          return roads.some((road: any) =>
            (road?.mainStreet ?? road?.crossStreet ?? '').toLowerCase().includes(queryStreet),
          )
        })
      }

      // apply incident filter
      if (incident.trim()) {
        const queryIncident = incident.trim().toLowerCase()
        filtered = filtered.filter((feature) => {
          const incidentKind = feature?.properties?.incidentKind ?? ''
          return incidentKind.toLowerCase().includes(queryIncident)
        })
      }

      const rootSummary = `filtered:${filtered.length}`
      setData(filtered)
      setDebugInfo(`status=success\nresponseCode=${statusCode}\nresponseSize=${responseSize}\nroot=${rootSummary}`)
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError'
      const message = isTimeout ? 'timeout' : err.message || 'unknown error'
      setError(`Error: ${message}`)
      setDebugInfo(`status=error\n${message}`)
      console.error('Fetch error:', err)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  // run once on startup: init storage, load cache, then fetch
  useEffect(() => {
    const initialize = async () => {
      try {
        // dynamic require avoids bundler crash if dependency is missing.
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
        const module = require('@react-native-async-storage/async-storage')
        AsyncStorage = module?.default ?? module
      } catch (err) {
        console.warn('AsyncStorage module is not available; caches are volatile in this session.', err)
      }

      await loadRegionOptions()
      await loadStreetOptions()
      await loadIncidentOptions()
      fetchData('', '', '')
    }

    initialize()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    )
  }

  // normalize features array shape
  const features =
    Array.isArray(data) ? data : Array.isArray(data?.features) ? data.features : []

  // show only latest 4 cards
  const totalHazards = features.length
  const latestFour = features.slice(0, 4)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NSW Transport Hazards</Text>
      {activeRegion ? <Text style={styles.infoLabel}>📍 Region: {activeRegion}</Text> : null}
      {activeStreet ? <Text style={styles.infoLabel}>🛣️ Street: {activeStreet}</Text> : null}
      {activeIncident ? <Text style={styles.infoLabel}>⚠️ Incident: {activeIncident}</Text> : null}

      <View style={styles.dropdownContainer}>
        {/* quick region dropdown */}
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setRegionDropdownVisible(!regionDropdownVisible)}
        >
          <Text style={styles.dropdownTriggerText}>
            Region: {selectedRegion || 'All'} {regionDropdownVisible ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {regionDropdownVisible && (
          <View style={styles.dropdownBox}>
            <TextInput
              style={styles.modalInput}
              placeholder="Search region..."
              value={regionSearch}
              onChangeText={setRegionSearch}
              autoCapitalize="none"
            />
            <ScrollView style={styles.dropdownList}>
              {regionOptions
                .filter((region) =>
                  region.toLowerCase().includes(regionSearch.toLowerCase()),
                )
                .map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={
                      selectedRegion === region
                        ? styles.regionOptionSelected
                        : styles.regionOption
                    }
                    onPress={() => {
                      setSelectedRegion(region)
                      setActiveRegion(region)
                      setRegionDropdownVisible(false)
                      fetchData(region, selectedStreet, selectedIncident)
                    }}
                  >
                    <Text>
                      {region}
                      {selectedRegion === region ? ' ✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button title="Get Hazards" onPress={() => fetchData(selectedRegion, selectedStreet, selectedIncident)} />
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* main filter modal */}
            <Text style={styles.modalTitle}>Filter by Region + Street + Incident</Text>

            <Text style={styles.modalSectionTitle}>Region</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Search region..."
              value={regionSearch}
              onChangeText={setRegionSearch}
              autoCapitalize="none"
            />
            <ScrollView style={[styles.dropdownList, { maxHeight: 130 }]}>
              {regionOptions
                .filter((region) =>
                  region.toLowerCase().includes(regionSearch.toLowerCase()),
                )
                .map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={
                      selectedRegion === region
                        ? styles.regionOptionSelected
                        : styles.regionOption
                    }
                    onPress={() => setSelectedRegion(region)}
                  >
                    <Text>
                      {region}
                      {selectedRegion === region ? ' ✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.modalSectionTitle}>Street</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Search street..."
              value={streetSearch}
              onChangeText={setStreetSearch}
              autoCapitalize="none"
            />
            <ScrollView style={[styles.dropdownList, { maxHeight: 130 }]}>
              {streetOptions
                .filter((street) =>
                  street.toLowerCase().includes(streetSearch.toLowerCase()),
                )
                .map((street) => (
                  <TouchableOpacity
                    key={street}
                    style={
                      selectedStreet === street
                        ? styles.regionOptionSelected
                        : styles.regionOption
                    }
                    onPress={() => setSelectedStreet(street)}
                  >
                    <Text>
                      {street}
                      {selectedStreet === street ? ' ✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.modalSectionTitle}>Incident</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Search incident kind..."
              value={incidentSearch}
              onChangeText={setIncidentSearch}
              autoCapitalize="none"
            />
            <ScrollView style={[styles.dropdownList, { maxHeight: 130 }]}>
              {incidentOptions
                .filter((incident) =>
                  incident.toLowerCase().includes(incidentSearch.toLowerCase()),
                )
                .map((incident) => (
                  <TouchableOpacity
                    key={incident}
                    style={
                      selectedIncident === incident
                        ? styles.regionOptionSelected
                        : styles.regionOption
                    }
                    onPress={() => setSelectedIncident(incident)}
                  >
                    <Text>
                      {incident}
                      {selectedIncident === incident ? ' ✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.modalActions}>
              {/* apply / clear buttons */}
              <Button
                title="Apply"
                onPress={() => {
                  const chosenRegion = selectedRegion || regionSearch
                  const chosenStreet = selectedStreet || streetSearch
                  const chosenIncident = selectedIncident || incidentSearch
                  setFilterModalVisible(false)
                  setActiveRegion(chosenRegion)
                  setActiveStreet(chosenStreet)
                  setActiveIncident(chosenIncident)
                  fetchData(chosenRegion, chosenStreet, chosenIncident)
                }}
              />
              <Button
                title="Clear"
                onPress={() => {
                  setRegionSearch('')
                  setStreetSearch('')
                  setIncidentSearch('')
                  setSelectedRegion('')
                  setSelectedStreet('')
                  setSelectedIncident('')
                  setActiveRegion('')
                  setActiveStreet('')
                  setActiveIncident('')
                  setFilterModalVisible(false)
                  fetchData('', '', '')
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {totalHazards > 0 ? (
        <View style={styles.result}>
          {/* summary + latest cards */}
          <Text style={styles.infoLabel}>🚨 Total Hazards: {totalHazards}</Text>
          <Text style={styles.sectionTitle}>Latest 4 Incidents</Text>
          <View style={styles.incidentFlexList}>
            {latestFour.map((item: any, index: number) => {
              const itemProps = item?.properties || {}
              const itemRoad = itemProps?.roads?.[0] || {}
              return (
                <View key={`incident-${index}`} style={styles.incidentCard}>
                  <Text style={styles.incidentCardTitle}>#{index + 1} {itemProps.displayName ?? 'N/A'}</Text>
                  <Text style={styles.incidentCardText}>🗂️ Category: {itemProps.mainCategory ?? 'N/A'}</Text>
                  <Text style={styles.incidentCardText}>⚠️ Kind: {itemProps.incidentKind ?? 'N/A'}</Text>
                  <Text style={styles.incidentCardText}>📍 Region: {itemRoad.region ?? 'N/A'}</Text>
                  <Text style={styles.incidentCardText}>🏘️ Suburb: {itemRoad.suburb ?? 'N/A'}</Text>
                  <Text style={styles.incidentCardText}>🛣️ Main St: {itemRoad.mainStreet ?? 'N/A'}</Text>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {debugInfo ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b3d91',
    marginTop: 6,
    marginBottom: 10,
  },
  incidentFlexList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  incidentCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dde7f5',
    padding: 10,
  },
  incidentCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c355e',
    marginBottom: 6,
  },
  incidentCardText: {
    fontSize: 12,
    color: '#2d3a4a',
    marginBottom: 4,
  },
  errorBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffcccc',
    borderRadius: 8,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 16,
  },
  debugBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eef6ff',
    borderRadius: 8,
  },
  debugText: {
    color: '#003366',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0077cc',
    borderRadius: 8,
    marginLeft: 12,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  regionList: {
    maxHeight: 180,
  },
  regionOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  regionOptionSelected: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#d0e8ff',
  },
  dropdownContainer: {
    marginTop: 16,
    width: '100%',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  dropdownTriggerText: {
    fontSize: 16,
  },
  dropdownBox: {
    marginTop: 6,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownList: {
    maxHeight: 180,
  },
})
