install.packages("dplyr")
install.packages("reader")
install.packages("tidycensus")
install.packages("sf")
install.packages("raster")
install.packages("r2d3")
install.packages("elevatr")

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
                                variables = "B19013_001",
                                state = "AZ",
                                county = "Maricopa",
                                geometry = TRUE) %>%
  dplyr::select(GEOID, estimate, geometry) %>%
  mutate(level = "cbg")

map_data_tract <- tidycensus::get_acs(geography = "tract",
                                variables = "B19013_001",
                                state = "AZ",
                                county = "Maricopa",
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


## to host on web, a json file must be generated
# Load necessary package
install.packages("jsonlite")
library(jsonlite)

# Save all_data as a JSON file
write_json(all_data, path = "map_data.json", pretty = TRUE)


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


