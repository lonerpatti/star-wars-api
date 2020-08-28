const app = require('express')();
const axios = require('axios');

const baseURL = 'https://swapi.dev/api/';

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', req.header('access-control-request-headers' || '*'));
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

//obter os ids dos filmes
const getFilmId = (url) => {
    const id = url.split('/')[5];
    return Number(id);
}

//obter as fotos dos personagens
  const getCharacterImageUrl = (url) => {
    const getCharacterId = url.split('/')[5];
    return `https://starwars-visualguide.com/assets/img/characters/${getCharacterId}.jpg`;
}

//obter as fotos dos personagens
const getFilmImageUrl = (id) => {
    return `https://starwars-visualguide.com/assets/img/films/${id}.jpg`;
}

//primeira rota
app.get('/films', async (req, res, next) => {
    try {
      const { data: { results } } = await axios.request({ baseURL, url: 'films' });
      results.forEach(x => x.id = getFilmId(x.url));
      return res.send(results).status(200);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  //rota para obtermos apenas um filme pelo ID
  app.get('/films/:id', async (req, res, next) => {
    try {
      const filmId = req.params.id;
      const { data } = await axios.request({ baseURL, url: `films/${filmId}` });
  
      const charactersRequests = await Promise.all(data.characters.map(characterUrl => {
        return axios.get(characterUrl);
      }));
  
      const characters = charactersRequests.map((y) => y.data).map((x) => {
        return {
          name: x.name,
          gender: x.gender,
          birthYear: x.birth_year,
          eyeColor: x.eye_color,
          height: x.height,
          mass: x.mass,
          photo: getCharacterImageUrl(x.url)
        }
      });
  
      data.id = getFilmId(data.url);
      data.photo = getFilmImageUrl(data.id);
      data.characters = characters;
  
      return res.send(data).status(200);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  //rota padrão caso o usuário informe alguma outra url
  app.all('*', async (req, res, next) => {
    res.send({
      routes: ['films', 'films/id']
    })
  })

  //para finalizar incluímos a porta onde nossa API será exposta
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Aplicação - Ativa :D | ${port}`);
});
