library(dplyr)
library(readr)
library(tidycensus)
library(sf)
library(raster)
library(r2d3)
library(elevatr)

# -------------------------------------------------------------------------
# choropleth

map_data <- tidycensus::get_acs(geography = "cbg",
                                variables = "B25077_001",
                                state = "WA",
                                county = "Pierce",
                                geometry = TRUE) %>%
  dplyr::select(GEOID, estimate, geometry) %>%
  mutate(level = "cbg")

map_data_tract <- tidycensus::get_acs(geography = "tract",
                                variables = "B25077_001",
                                state = "WA",
                                county = "Pierce",
                                geometry = TRUE) %>%
  dplyr::select(GEOID, estimate, geometry) %>%
  mutate(level = "tract")

all_data <- bind_rows(map_data, map_data_tract)

r2d3::r2d3(data = all_data, 
           script = "d3_map_example.js",
           viewer = "browser",
           options = list(na_color = "gray",
                          zoom = TRUE,
                          geog = "cbg"))

# -------------------------------------------------------------------------
# contours from raster

elev <- elevatr::get_elev_raster(all_data, z = 8)

elev_query <- raster::crop(elev, all_data)

x <- raster::as.matrix(elev_query)

r2d3::r2d3(data = x, 
           script = "d3_raster_example.js",
           viewer = "browser",
           options = list(interval = 100,
                          pixel_resolution = 3,
                          color_choice = "x"))

# -------------------------------------------------------------------------


