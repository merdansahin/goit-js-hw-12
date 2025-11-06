import { fetchImages } from './api.js';
import { createMarkup } from './render.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.loader');

let query = '';
let page = 1;
const perPage = 20;
let lightbox;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  query = e.target.elements.searchQuery.value.trim();
  if (!query) return;

  loader.classList.remove('hidden');
  loadMoreBtn.classList.add('hidden');

  try {
    const data = await fetchImages(query, page, perPage);
    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message: 'Sorry, no images found. Try again!',
      });
      loader.classList.add('hidden');
      return;
    }

    gallery.innerHTML = createMarkup(data.hits);
    loader.classList.add('hidden');
    loadMoreBtn.classList.remove('hidden');

    lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    if (data.totalHits <= perPage) {
      loadMoreBtn.classList.add('hidden');
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Something went wrong!' });
  }
}

async function onLoadMore() {
  page += 1;
  loader.classList.remove('hidden');
  try {
    const data = await fetchImages(query, page, perPage);
    gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

    lightbox.refresh();

    const cardHeight = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect().height;

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (page * perPage >= data.totalHits) {
      loadMoreBtn.classList.add('hidden');
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Failed to load more images' });
  } finally {
    loader.classList.add('hidden');
  }
}
