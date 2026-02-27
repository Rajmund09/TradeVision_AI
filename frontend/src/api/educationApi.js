import axios from './axios';

export const fetchEducationContent = async () => {
  const response = await axios.get('/education/content');
  return response.data;
};
