const searchBar = document.querySelector("#searchForm"),
  showsSection = document.querySelector("#shows"),
  h2 = document.querySelector("#title");

const tvMazeSearchShows = async (result) => {
  const config = { params: { q: result } };
  const res = await axios.get("https://api.tvmaze.com/search/shows", config);
  return displaySearch(res.data); // res.data is an array of Objects
};

const tvMazeSearchPeople = async (result) => {
  const config = { params: { q: result } };
  const res = await axios.get("https://api.tvmaze.com/search/people", config);
  return displaySearch(res.data); // res.data is an array of Objects
};

const displayObjInfo = (obj) => {
  // using lexical scope to retrieve ancestor variables for displayUl function
  let showOrPerson = Object.keys(obj)[1];
  const ul = document.createElement("ul"),
    objInfo = document.createElement("div");

  const fetchEpData = async (url, str) => {
    //needs to be inside same function as displayUl otherwise undefined error
    const res = await axios.get(url);
    return displayUl(res.data, str);
  };

  const displayUl = (data, str) => {
    const anchor = document.createElement("a"),
      li = document.createElement("li");

    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.href = data.url;

    anchor.append(data.name);
    li.append(str);
    li.append(anchor);
    ul.append(li);
    objInfo.append(ul);
  };

  if (showOrPerson === "show") {
    const tvShow = obj.show;

    objInfo.innerHTML =
      // tvNetwork needs href
      `<p><a class="title" href="${tvShow.url
      }" target="_blank" rel="noopener noreferrer">${tvShow.name}</a>
      <span>
      (<span class="tvNetwork">${tvShow.network ? tvShow.network.name : tvShow.webChannel.name
      }</span>, 
      ${tvShow.premiered
        ? tvShow.premiered.slice(0, tvShow.premiered.indexOf("-"))
        : "TBA"
      } - 
      ${tvShow.ended ? tvShow.ended.slice(0, tvShow.ended.indexOf("-")) : "now"
      })
      </span>
      </p>`;

    if (tvShow._links.nextepisode)
      fetchEpData(tvShow._links.nextepisode.href, "Next Episode: ");
    if (tvShow._links.previousepisode)
      fetchEpData(tvShow._links.previousepisode.href, "Previous Episode: ");
  } else if (showOrPerson === "person") {
    const tvPerson = obj.person;
    objInfo.innerHTML = `<p><a class="title" href="${tvPerson.url}" target="_blank" rel="noopener noreferrer">${tvPerson.name}</a></p>`;
  }

  return objInfo;
};

const displaySearch = (shows) => {
  for (let obj of shows) {
    let showOrPerson = Object.keys(obj)[1], // the second key in the object is either 'show' or 'person'
      flexBox = document.createElement("article"),
      newFig = document.createElement("figure"),
      newImg = document.createElement("img"),
      newCaption = document.createElement("figcaption");

    h2.textContent = "Search";

    if (obj[showOrPerson].image) {
      newImg.src = obj[showOrPerson].image.medium;
      newImg.alt = `picture of ${obj[showOrPerson].name}`;
      newCaption.textContent = obj[showOrPerson].name;

      newFig.append(newImg);
      newFig.append(newCaption);
    } else {
      newImg.src =
        "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
      newImg.alt = "No image (yet)";
      newFig.append(newImg);
    }

    flexBox.append(newFig);
    flexBox.append(displayObjInfo(obj));
    showsSection.append(flexBox);
  }
};

const removeImages = () => {
  const images = document.querySelectorAll("#shows article");
  h2.textContent = "";
  for (let image of images) image.remove();
};

searchBar.addEventListener("submit", function (e) {
  e.preventDefault();
  removeImages();
  let searchResult = searchBar.elements.query.value;

  setTimeout(() => {
    tvMazeSearchShows(searchResult);
    setTimeout(() => tvMazeSearchPeople(searchResult), 300);
  }, 100);

  searchBar.elements.query.value = "";
});
