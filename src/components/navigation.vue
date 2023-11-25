<script>
export default {
  name: "NavigationBar",
  data() {
    return {
      routes: [
        { path: '/', name: 'Вход' },
        { path: '/broker', name: 'Главная' },
        { path: '/admin', name: 'Администрирование' },
      ],
    };
  },
};
</script>

<template>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;500;700&family=Ubuntu&family=Ubuntu+Mono&display=swap" rel="stylesheet">

  <nav>
    <ul>
      <li v-for="(route, index) in routes" :key="index">
        <router-link :to="route.path">{{ route.name }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
	* {
		font-family: 'Ubuntu Mono', sans-serif;
		font-size: 20px;
	}

  nav {
    background-color: rgb(47, 54, 200);
    padding: 15px;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
  }

  li {
    margin-right: 10px;
  }

  a {
    text-decoration: none;
    color: white;
  }

  a:hover {
    cursor: pointer;
  }
</style>
