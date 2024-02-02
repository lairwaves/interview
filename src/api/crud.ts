import { api } from 'src/boot/axios';
import { CrudTestData } from './crud.type';

function getCrudTest() {
  return api.request<{ result: CrudTestData[] }>({
    url: '/crudTest/a',
    method: 'get',
  });
}

function postCrudTest(data: CrudTestData) {
  return api.request({
    url: '/crudTest',
    method: 'post',
    data,
  });
}

function patchCrudTest(data: CrudTestData) {
  return api.request({
    url: '/crudTest',
    method: 'patch',
    data,
  });
}

function deleteCrudTest(id: string) {
  return api.request({
    url: `/crudTest/${id}`,
    method: 'delete',
  });
}

export { getCrudTest, postCrudTest, patchCrudTest, deleteCrudTest };
