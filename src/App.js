import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import "./App.css";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Loader from "./assets/images/loader.gif";
import GiphyLogo from "./assets/images/giphy_logo.gif";
function App() {
  //Declare our states and Api Key
  const API_KEY = "JvVxK9W1GoEUA10N8NykHOkLVqku3k1A";
  const [searchValue, setSearchValue] = useState("");
  const [images, setImages] = useState([1]);
  const [offset, setOffset] = useState(0);
  const imagesPannelRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("gifs");

  //Handles Scrolling, changes is our offset state to +20 of our current offset.
  const handleScroll = (e) => {
    const imagesContainer = e.target;
    if (imagesContainer.scrollTop > imagesContainer.scrollHeight - 1000) {
      //Here we conditionally check if loading is false, then set it to true if it is equal to false. This does 1 of 2 things
      //1. This allows to to only fetch new results once opon nearing the bottom. Which is the core functionallity we need
      //2. Adds a loading spinner to the bottom
      if (loading === false) {
        setLoading(true);
        setOffset(offset + 20);
      }
    }
  };

  // Handles searching. String interpolation is used for accessing our state varriables we set as we scroll, search, and change to searching for stickers or gifs.
  const handleSearch = (e) => {
    // console.log(offset);
    e?.preventDefault();
    // console.log(searchValue);
    if (searchValue) {
      axios
        .get(
          `https://api.giphy.com/v1/${searchType}/search?api_key=${API_KEY}&q=${searchValue}&offset=${offset}&limit=20`,
          {
            method: "get",
          }
        )
        .then((response) => {
          //This if else statement chekcs if loading equals true, which would mean the user has scrolled to the bottom of the current 20 and needs to fetch another 20.
          if (loading === true) {
            //Convert object values into array
            const newImages = Object.values(response.data.data);
            //When we update our state, we use the spread operator to essentially "push" our new items into our images state, while preservating our old ones.
            setImages([...images, ...newImages]);
            setLoading(false);
          } else {
            //If we reach this else block, we are submitting the form to search, so we don't need to append images to an already existing set. We are starting the first set here.
            const newImages = Object.values(response.data.data);
            setImages(newImages);
          }
        });
    }
  };

  //Here we are changing the search type to gifs or stickers depending on what is selected in the drop down menu
  const handleChangeSearchType = (e) => {
    setSearchType(e.target.value);
  };

  //If we change the search type while we have a current search in progress, this use effect while automatically fetch the new types with our same search.
  useEffect(() => {
    if (images) {
      handleSearch();
    }
  }, [searchType]);

  //In the handleScroll function, we set a new offset when we are near the bottom set, when that is changed we fetch more results.
  useEffect(() => {
    handleSearch();
  }, [offset]);

  return (
    <div className="app">
      <div className="app__title">
        <img src={GiphyLogo} alt="Giphy Logo" />{" "}
        <p>Search Project By Hunter White</p>
      </div>
      {/* Using a button with type="submit" and putting an obSubmit function in our form, allows us to call the same function upon either clicking search or pushing enter on the keyboard. This prevents writting a function call in two seperate places. */}
      <form onSubmit={(e) => handleSearch(e)} className="app__searchWrapper">
        <div className="app__searchInput">
          <SearchIcon />
          <input
            placeholder="Search..."
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
          />
        </div>
        <span>
          <Button type="submit" variant="contained">
            Search
          </Button>
        </span>
      </form>
      {/* This is the drop down menu for our search style */}
      <div className="app__searchTypeSelector">
        <p>Select search type: </p>
        <FormControl>
          <InputLabel>SearchType</InputLabel>
          <Select
            value={searchType}
            label="Search Type"
            onChange={(e) => handleChangeSearchType(e)}
          >
            <MenuItem value="stickers">Stickers</MenuItem>
            <MenuItem value="gifs">Gifs</MenuItem>
          </Select>
        </FormControl>
      </div>
      {/* If we have a list of images, we conditionally render our pannel. If not, we display message to the user asking them to intiate a search */}
      {images ? (
        <>
          <div
            onScroll={(e) => handleScroll(e)}
            ref={imagesPannelRef}
            className="app__imagesContainer"
          >
            {images?.map((image) => (
              <a
                key={image.id}
                className="app__imagesContainerImage"
                href={image.url}
              >
                <iframe
                  src={image.embed_url}
                  width="350"
                  height="350"
                  frameBorder="0"
                  class="giphy-embed"
                  allowFullScreen
                  title={image.slug}
                ></iframe>

                <p>{image.title}</p>
              </a>
            ))}
          </div>
          {/* If our loading state is true, we load a spinnier */}

          {loading && (
            <div className="app__imagesContainerLoadingMessage">
              <img src={Loader} alt="loading message" />
              <p>Loading...</p>
            </div>
          )}
        </>
      ) : (
        // Ask user to search for an image
        <p className="app__noSearchImages">
          No Resulsts found. Try searching for an image.
        </p>
      )}
    </div>
  );
}

export default App;
