import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

const KEY_API = '34551124-3d6c313521296c54d83fa1029';

const bodyEl = document.querySelector('body');
const formEl = document.querySelector('.search-form');
const inputSearchEl = document.querySelector('input');
const wrapGalleryEl = document.querySelector('.gallery');
const btnLoadMoreEl = document.querySelector('.load-more');
const messageEndEl = document.querySelector('.message-end');

let countPages = 1;
let currentHits = 0;
let isAllPitures = false;

btnLoadMoreEl.classList.add('ishidden');
messageEndEl.classList.add('ishidden');
bodyEl.classList.add('stop-scrolling');
// axios.defaults.baseURL('');

const showModalImg = () => {
  gallery = new SimpleLightbox('gallery__link');

  gallery.captionDelay = 250;
  gallery.on('show.simplelightbox');
};

async function fetchPhoto(name, number_page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${KEY_API}&q=${name}`,
      {
        params: {
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: 'true',
          per_page: '40',
          page: `${number_page}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
}

const renderOneCardPicture = (
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads
) => {
  //
  return `<div class="photo-card">
  <div class="thumb gallery__item">
      <a class="gallery__link" href=${largeImageURL}>
        <img class="gallery__image" src=${webformatURL} alt=${tags} loading="lazy" />
      </a>
    </div>
    <div class="info">
      <p class="info-item likes">
      <b>${likes}</b>
      </p>
      <p class="info-item look">
      <b>${views} </b>
      </p>
      <p class="info-item comment">
      <b>${comments}</b>
      </p>
      <p class="info-item download">
      <b>${downloads}</b>
      </p>
    </div>
  </div>`;
};

const setClassesEndPage = () => {
  btnLoadMoreEl.classList.add('ishidden');
  messageEndEl.classList.remove('ishidden');
  window.removeEventListener('scroll', handleScrollPage);
};

const setClassesStartPage = () => {
  btnLoadMoreEl.classList.remove('ishidden');
  messageEndEl.classList.add('ishidden');
  window.addEventListener('scroll', handleScrollPage);
};

const errorRespons = () =>
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );

const fetchAllCards = async numberCards => {
  const nameSearch = inputSearchEl.value;
  const itemPicture = await fetchPhoto(nameSearch, numberCards)
    .then(response => response)
    .catch(error => {
      console.log(error);
      // errorRespons();
    });

  try {
    const arrayPitures = [...itemPicture.data.hits];

    let totalHits = itemPicture.data.totalHits;
    currentHits += arrayPitures.length;
    isAllPitures = currentHits < totalHits ? false : true;

    // console.log(currentHits);
    if (arrayPitures.length === 0) errorRespons();
    if (isAllPitures || arrayPitures.length === 0) {
      setClassesEndPage();
      return;
    }

    if (numberCards === 1) Notify.info(`Hooray! We found ${totalHits} images.`);
    bodyEl.classList.remove('stop-scrolling');

    const renderCardsPictures = arrayPitures
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return renderOneCardPicture(
            webformatURL,
            largeImageURL,
            tags,
            likes,
            views,
            comments,
            downloads
          );
        }
      )
      .join('');
    wrapGalleryEl.insertAdjacentHTML('beforeEnd', renderCardsPictures);

    let gallery = new SimpleLightbox('.gallery a');
    gallery.captionDelay = 250;
    gallery.on('show.simplelightbox');
  } catch (error) {
    console.log(error.message);
    errorRespons();
    setClassesEndPage();
  }
};

const handleSearchPictures = e => {
  e.preventDefault();
  wrapGalleryEl.innerHTML = '';
  countPages = 1;
  currentHits = 0;
  fetchAllCards(countPages);
  setClassesStartPage();
};

const handleLoadMore = () => {
  btnLoadMoreEl.classList.add('ishidden');
  countPages += 1;
  fetchAllCards(countPages);
  isAllPitures
    ? messageEndEl.classList.remove('ishidden')
    : btnLoadMoreEl.classList.remove('ishidden');
};

const handleClickGalleryByImage = e => {
  e.preventDefault();

  const isActiveImage = e.target.classList.contains('gallery__image');
  if (!isActiveImage) {
    return;
  }
  let urlOriginalImage = e.target.dataset.src;
};

function handleScrollPage() {
  const { height: cardHeight } =
    wrapGalleryEl.firstElementChild?.getBoundingClientRect() || 0;

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
  if (
    window.scrollY + window.innerHeight + cardHeight >=
    document.documentElement.scrollHeight
  ) {
    countPages += 1;
    fetchAllCards(countPages);
  }
}

formEl.addEventListener('submit', handleSearchPictures);
btnLoadMoreEl.addEventListener('click', handleLoadMore);
wrapGalleryEl.addEventListener('click', handleClickGalleryByImage);
