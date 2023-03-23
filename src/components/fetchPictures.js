import axios from 'axios';

const KEY_API = '34551124-3d6c313521296c54d83fa1029';
// axios.defaults.baseURL('');

export async function fetchPhoto(name, number_page) {
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
}
