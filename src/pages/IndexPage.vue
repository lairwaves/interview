<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <form @submit.prevent.stop="addData()" class="q-gutter-md">
        <div class="q-mb-xl">
          <q-input
            ref="nameRef"
            v-model="tempData.name"
            :rules="[rules.notEmpty]"
            label="姓名"
          />
          <q-input
            ref="ageRef"
            :rules="[rules.notEmpty, rules.isPositiveInteger]"
            v-model="tempData.age"
            label="年齡"
          />
          <q-btn
            color="primary"
            :loading="loading.add"
            class="q-mt-md"
            type="submit"
          >
            新增
          </q-btn>
        </div>
      </form>

      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :loading="loading.get"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
    <!-- 編輯 -->
    <q-dialog v-model="isEdit" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">編輯資料</div>
        </q-card-section>
        <form
          @submit.prevent.stop="
            editData({
              id: tempEditData.id,
              name: tempEditData.name,
              age: Number(tempEditData.age),
            })
          "
          class="q-gutter-md"
        >
          <q-card-section class="q-pt-none">
            <q-input
              ref="nameRef"
              v-model="tempEditData.name"
              :rules="[rules.notEmpty]"
              label="姓名"
            />
            <q-input
              ref="ageRef"
              :rules="[rules.notEmpty, rules.isPositiveInteger]"
              v-model="tempEditData.age"
              label="年齡"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="取消" @click="isEdit = false" />
            <q-btn
              color="primary"
              label="更新"
              :loading="loading.edit"
              type="submit"
            >
            </q-btn>
          </q-card-actions>
        </form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import {
  getCrudTest,
  postCrudTest,
  patchCrudTest,
  deleteCrudTest,
} from 'src/api/crud';
import type { CrudTestData } from 'src/api/crud.type';
interface btnType {
  label: string;
  icon: string;
  status: string;
}
const $q = useQuasar();

const blockData = ref<CrudTestData[]>();
const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);

const rules = {
  notEmpty: (val: string) => !!val || '欄位不得為空白',
  isPositiveInteger: (val: string) =>
    (/^\d+$/.test(val) && parseInt(val, 10) > 0) || '欄位必須為正整數',
};
const nameRef = ref();
const ageRef = ref();
const onReset = async () => {
  tempData.value.name = '';
  tempData.value.age = '';

  nameRef.value.resetValidation();
  ageRef.value.resetValidation();
};
const tempData = ref({
  name: '',
  age: '',
});

const loading = ref({
  get: false,
  add: false,
  edit: false,
  delete: false,
});
const getData = async () => {
  loading.value.get = true;
  blockData.value = [];
  try {
    const res = await getCrudTest();
    console.log(res.data);
    blockData.value = res.data.result;
  } catch (error) {
    console.log(error);
    $q.notify({
      icon: 'error',
      type: 'error',
      color: 'negative',
      message: '發生錯誤',
    });
  } finally {
    loading.value.get = false;
  }
};
const addData = async () => {
  loading.value.add = true;
  nameRef.value.validate();
  ageRef.value.validate();

  if (nameRef.value.hasError || ageRef.value.hasError) {
    loading.value.add = false;
    // form has error
    return;
  }
  try {
    const res = await postCrudTest({
      name: tempData.value.name,
      age: Number(tempData.value.age),
    });
    console.log(res.data);
    $q.notify({
      icon: 'done',
      color: 'positive',
      message: '送出成功',
      position: 'top',
    });
    onReset();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value.add = false;
    await getData();
  }
};
const isEdit = ref(false);
const tempEditData = ref({
  id: '',
  name: '',
  age: '',
});
const editData = async (data: CrudTestData) => {
  loading.value.edit = true;
  try {
    const res = await patchCrudTest(data);
    console.log(res.data);
    $q.notify({
      icon: 'done',
      type: 'positive',
      color: 'positive',
      message: '送出成功',
    });
    isEdit.value = false;
    await getData();
  } catch (error) {
    console.log(error);
    $q.notify({
      icon: 'error',
      type: 'error',
      color: 'negative',
      message: '發生錯誤',
    });
    loading.value.edit = false;
  } finally {
    loading.value.edit = false;
  }
};
const isDelete = ref(false);
const deleteData = async (id: string) => {
  loading.value.delete = true;
  try {
    $q.dialog({
      title: '提示',
      message: '是否確定刪除該筆資料？',
      cancel: '取消',
      ok: '確認',

      persistent: true,
    })
      .onOk(async () => {
        console.log('>>>> OK');
        await deleteCrudTest(id);
        $q.notify({
          icon: 'done',
          type: 'positive',
          color: 'positive',
          message: '刪除成功',
        });
        await getData();
      })
      .onOk(() => {
        // console.log('>>>> second OK catcher')
      })
      .onCancel(() => {
        // console.log('>>>> Cancel')
      })
      .onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      });
  } catch (error) {
    console.log(error);
    $q.notify({
      icon: 'error',
      type: 'error',
      color: 'negative',
      message: '發生錯誤',
    });
    loading.value.delete = false;
  } finally {
    loading.value.delete = false;
  }
};

function handleClickOption(
  btn: btnType,
  data: { id: string; name: string; age: number }
) {
  // ...
  console.log(btn, data);
  switch (btn.status) {
    case 'edit':
      tempEditData.value.id = data.id;
      tempEditData.value.name = data.name;
      tempEditData.value.age = `${data.age}`;
      isEdit.value = true;
      break;
    case 'delete':
      isDelete.value = true;
      deleteData(data.id);
      break;
  }
}

onMounted(async () => {
  await getData();
});
</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
