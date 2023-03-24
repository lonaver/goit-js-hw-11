import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchPhoto, per_page } from './components/fetchPictures';

const bodyEl = document.querySelector('body');
const formEl = document.querySelector('.search-form');
const inputSearchEl = document.querySelector('input');
const wrapGalleryEl = document.querySelector('.gallery');
const btnLoadMoreEl = document.querySelector('.load-more');
const messageEndEl = document.querySelector('.message-end');

let countPages = 1;
let totalPages = 0;
let currentHits = 0;
let totalHits = 0;

btnLoadMoreEl.classList.add('ishidden');
messageEndEl.classList.add('ishidden');
bodyEl.classList.add('stop-scrolling');

const showModalImg = () => {
  gallery = new SimpleLightbox('gallery__link');

  gallery.captionDelay = 250;
  gallery.on('show.simplelightbox');
};

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
  //btnLoadMoreEl.classList.remove('ishidden');
  messageEndEl.classList.add('ishidden');

  window.addEventListener('scroll', handleScrollPage);
};

const allIsHidden = () => {
  btnLoadMoreEl.classList.add('ishidden');
  messageEndEl.classList.add('ishidden');
};

const errorRespons = () =>
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );

const showBigPicture = () => {
  let gallery = new SimpleLightbox('.gallery a');
  gallery.captionDelay = 250;
  gallery.on('show.simplelightbox');
};

const renderFetchingPictures = arrayPitures => {
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
};

const responseFetchPhoto = async numberCards => {
  const nameSearch = inputSearchEl.value.trim();
  if (nameSearch === '') return;
  try {
    const data = await fetchPhoto(nameSearch, numberCards);
    return data;
  } catch (error) {
    console.log(error);
    allIsHidden();
  }
};

const fetchAllCards = async numberCards => {
  try {
    const itemPicture = await responseFetchPhoto(numberCards);

    const arrayPitures = [...itemPicture.data.hits];

    totalHits = itemPicture.data.totalHits;
    totalPages = Math.ceil(totalHits / per_page);
    currentHits += arrayPitures.length;
    console.log(
      'countPages, totalPages, currentHits',
      countPages,
      totalPages,
      currentHits
    );
    if (currentHits === 0) {
      errorRespons();
      allIsHidden();
      return;
    }

    if (numberCards === 1) {
      Notify.info(`Hooray! We found ${totalHits} images.`);
      bodyEl.classList.remove('stop-scrolling');
    }

    renderFetchingPictures(arrayPitures);
    showBigPicture();

    if (countPages === totalPages && totalPages > 0) setClassesEndPage();

    if (countPages !== totalPages) {
      setClassesStartPage();
    }
  } catch (error) {
    console.log(error.message);
    allIsHidden();
  }
};

const resetValue = () => {
  wrapGalleryEl.innerHTML = '';
  countPages = 1;
  currentHits = 0;
  totalPages = 0;
  totalHits = 0;
};

const handleSearchPictures = e => {
  e.preventDefault();
  resetValue();
  fetchAllCards(countPages);
};

const handleLoadMore = () => {
  btnLoadMoreEl.classList.add('ishidden');
  countPages += 1;
  fetchAllCards(countPages);
};

const handleClickGalleryByImage = e => {
  e.preventDefault();

  const isActiveImage = e.target.classList.contains('gallery__image');
  if (!isActiveImage) {
    return;
  }
  let urlOriginalImage = e.target.dataset.src;
};

const hasMoreQuotes = (page, limit, total) => {
  const startIndex = (page - 1) * limit + 1;
  return total === 0 || startIndex < total;
};

function handleScrollPage() {
  const { height: cardHeight } =
    wrapGalleryEl.firstElementChild?.getBoundingClientRect() || 0;

  // window.scrollBy({
  //   top: cardHeight * 2,
  //   behavior: 'smooth',
  // });

  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (
    scrollTop + clientHeight >= scrollHeight - 5 &&
    hasMoreQuotes(countPages, per_page, totalHits)
  ) {
    countPages++;
    fetchAllCards(countPages);
  }
}

formEl.addEventListener('submit', handleSearchPictures);
btnLoadMoreEl.addEventListener('click', handleLoadMore);
wrapGalleryEl.addEventListener('click', handleClickGalleryByImage);
