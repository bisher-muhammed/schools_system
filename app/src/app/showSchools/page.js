"use client"

import { useState, useEffect, useCallback } from "react"
import { getSchools, getStates, getCities } from "@/actions/ScoolList.actions"
import { debounce } from "@/debounce"
import { useRouter } from "next/navigation"


export default function ShowSchoolsPage() {
  const [schools, setSchools] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()


  useEffect(() => {
    async function initializeData() {
      setLoading(true)
      try {
        const [statesData, citiesData, schoolsData] = await Promise.all([
          getStates(),
          getCities(),
          getSchools()
        ])
        setStates(statesData)
        setCities(citiesData)
        setSchools(schoolsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }
    initializeData()
  }, [])

  async function fetchSchools(state = "", city = "", search = "") {
    setLoading(true)
    setError("")
    try {
      const data = await getSchools({
        state: state || undefined,
        city: city || undefined,
        search: search || undefined,
      })
      setSchools(data)
    } catch (err) {
      console.error("Error fetching schools:", err)
      setError("Failed to fetch schools. Please try again.")
      setSchools([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStateChange(e) {
    const state = e.target.value
    setSelectedState(state)
    await fetchSchools(state, selectedCity, searchTerm)
  }

  async function handleCityChange(e) {
    const city = e.target.value
    setSelectedCity(city)
    await fetchSchools(selectedState, city, searchTerm)
  }

  // Create debounced search function with useCallback
  const debouncedSearch = useCallback(
    debounce((searchValue, state, city) => {
      fetchSchools(state, city, searchValue)
    }, 500),
    [],
  )

  function handleSearch(e) {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value, selectedState, selectedCity)
  }

  function handleSearchClick() {
    fetchSchools(selectedState, selectedCity, searchTerm)
  }

  // Clear Filters
  async function handleClearFilters() {
    setSelectedState("")
    setSelectedCity("")
    setSearchTerm("")
    await fetchSchools()
  }

  const hasActiveFilters = selectedState || selectedCity || searchTerm

  // Helper function to get image URL
  function getImageUrl(imagePath) {
  if (!imagePath) return "/placeholder.svg";

  // If imagePath is already a full URL (from Cloudinary), return it
  if (imagePath.startsWith("http")) return imagePath;

  // Otherwise, fallback (if you store images locally in /public)
  return `/schoolImages/${imagePath}`;
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">School Search</h1>
          <p className="text-xl opacity-90 mb-8">Find the right school for your child.</p>
          
          {/* Search Bar */}
          <div className="flex max-w-2xl mx-auto mb-8">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="School Name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-4 text-gray-900 bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSearchClick}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-r-lg font-semibold text-lg transition-colors duration-200 disabled:opacity-50"
            >
              Search
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* Choose State */}
            <div className="relative">
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="appearance-none bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-300 min-w-[140px]"
                disabled={loading}
              >
                <option value="">Choose State</option>
                {states.map((state, i) => (
                  <option key={i} value={state} className="text-gray-900">
                    {state}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Choose City */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="appearance-none bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-300 min-w-[140px]"
                disabled={loading}
              >
                <option value="">Choose City</option>
                {cities.map((city, i) => (
                  <option key={i} value={city} className="text-gray-900">
                    {city}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-6">
              <button
                onClick={handleClearFilters}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "Loading..." : `${schools.length} school${schools.length !== 1 ? "s" : ""} found`}
            </h2>

            <button
              onClick={() => router.push("/addSchool")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ➕ Add New School
            </button>
          </div>


        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && schools.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">🏫</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No schools found</h3>
            {hasActiveFilters ? (
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            ) : (
              <p className="text-gray-500">No schools have been added yet</p>
            )}
          </div>
        )}

        {/* Schools Grid - E-commerce Style */}
        {!loading && schools.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                {/* School Image */}
                <div className="relative h-48">
                  {school.image ? (
                    <img
                      src={getImageUrl(school.image) || "/placeholder.svg"}
                      alt={school.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", school.image, "URL:", e.target.src)
                        e.target.style.display = "none"
                        e.target.nextElementSibling.style.display = "flex"
                      }}
                    />
                  ) : null}

                  {/* Fallback image placeholder */}
                  <div
                    className={`h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${school.image ? "hidden" : "flex"}`}
                    style={{ display: school.image ? "none" : "flex" }}
                  >
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🏫</div>
                      <div className="text-sm">No Image</div>
                    </div>
                  </div>
                </div>

                {/* School Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {school.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium truncate">
                      {school.city}, {school.state}
                    </span>
                  </div>

                  {/* Address */}
                  {school.address && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {school.address}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {school.contact && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${school.contact}`} className="hover:text-blue-600 transition-colors truncate">
                          {school.contact}
                        </a>
                      </div>
                    )}
                    {school.email_id && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a
                          href={`mailto:${school.email_id}`}
                          className="hover:text-blue-600 transition-colors truncate"
                        >
                          {school.email_id}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!loading && schools.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-6 px-8 inline-block">
              <p className="text-gray-700 text-lg">
                Showing <span className="font-semibold text-blue-600">{schools.length}</span> school{schools.length !== 1 ? "s" : ""}
                {hasActiveFilters && (
                  <span className="ml-1">
                    {selectedState && ` in ${selectedState}`}
                    {selectedCity && `, ${selectedCity}`}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
