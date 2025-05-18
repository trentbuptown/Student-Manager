import axios from './axios';

export const getScores = async (filters = {}) => {
  try {
    const response = await axios.get('/scores', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getScoreById = async (id: number) => {
  try {
    const response = await axios.get(`/scores/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createScore = async (data: any) => {
  try {
    const response = await axios.post('/scores', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateScore = async (id: number, data: any) => {
  try {
    const response = await axios.put(`/scores/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteScore = async (id: number) => {
  try {
    const response = await axios.delete(`/scores/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentReport = async (studentId: number) => {
  try {
    const response = await axios.get(`/reports/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClassReport = async (classId: number) => {
  try {
    const response = await axios.get(`/reports/class/${classId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubjectReport = async (subjectId: number) => {
  try {
    const response = await axios.get(`/reports/subject/${subjectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 