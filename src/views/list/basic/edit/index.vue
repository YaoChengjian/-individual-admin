<template>
  <div>
    <y-card style="border-radius: 0">
      <y-text type="heading" size="lg">修改用户</y-text>
      <y-text type="placeholder" style="margin-top: 6px">
        修改用户基本信息后点击保存按钮
      </y-text>
    </y-card>
    <y-page>
      <y-card>
        <y-loading :loading="loading">
          <edit-form v-if="user" :data="user" />
        </y-loading>
      </y-card>
    </y-page>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { YMessage } from 'y-element-ultra';
  import { usePageTab } from '@/utils/use-page-tab';
  import EditForm from '../components/edit-form.vue';
  import { getUser } from '@/api/system/user';
  import type { User } from '@/api/system/user/model';

  defineOptions({ name: 'ListBasicEdit' });

  const { setPageTabTitle } = usePageTab();
  const route = useRoute();
  const userId = Number(route.params.id);

  /** 查询状态 */
  const loading = ref(true);

  /** 用户信息 */
  const user = ref<User>();

  /** 查询用户信息 */
  const query = () => {
    if (!userId || isNaN(userId)) {
      return;
    }
    getUser(userId)
      .then((data) => {
        loading.value = false;
        user.value = data;
        // 修改页签标题
        setPageTabTitle(`修改用户[${user.value.nickname}]`);
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      });
  };

  query();
</script>
