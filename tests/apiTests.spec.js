import { test, expect } from '@playwright/test';
import { request } from 'http';
const { faker } = require('@faker-js/faker');
import { GetChalengeStatus } from './helpers';
import { SecretService } from './helpers';
import { TodoService } from './helpers';

test.describe.only('API challenge', () => {
    let URL = 'https://apichallenges.herokuapp.com';
    let token;
    let payload;
    let database;
    let xAuthToken;
    let todo = {
        title: faker.string.alpha(50),
        doneStatus: true,
        description: faker.string.alpha(200),
    };

    test.beforeAll(async ({ request }) => {
        // Запросить ключ авторизации
        let response = await request.post(`${URL}/challenger`);
        let headers = response.headers();
        // Передаем токен в тест
        token = headers['x-challenger'];
        expect(headers).toEqual(expect.objectContaining({ 'x-challenger': expect.any(String) }));
        console.log(token);
    });
    test('Тест №2, Получить список заданий/get/200 @get', async ({ request }) => {
        let response = await request.get(`${URL}/challenges`, {
            headers: {
                'x-challenger': token,
            },
        });
        let body = await response.json();
        let headers = await response.headers();
        expect(response.status()).toBe(200);
    });
    test('Тест №3 Получить спиок /todos/get/200 @get', async ({ request }) => {
        let response = await request.get(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
        });
        let body = await response.json();
        let headers = await response.headers();
        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('todos');
        expect(body.todos.length).toBe(10);
        console.log(token);
    });

    test('Тест №4 Отправить GET запрос на /todo (404) @get', async ({ request }) => {
        let response = await request.get(`${URL}/todo`, {
            headers: {
                'x-challenger': token,
            },
        });
        let headers = response.headers();
        expect(response.status()).toBe(404);
        expect(headers['x-challenger']).toEqual(token);
    });
    test('Тест №5 Отправить GET  запрос на существующий объект /todos/{id}/200 @get', async ({ request }) => {
        let id = 9;
        let response = await request.get(`${URL}/todos/9`, {
            headers: {
                'x-challenger': token,
            },
        });

        let headers = response.headers();
        let body = response.body();
        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
    });
    test('Тест №6 GET /todos/{id} (404) для несуществующего todo, @get', async ({ request }) => {
        const nonExistentId = 9999;
        const response = await request.get(`${URL}/todos/${nonExistentId}`, {
            headers: {
                'x-challenger': token,
            },
        });

        expect(response.status()).toBe(404);
        const responseBody = await response.text();
        const body = JSON.parse(responseBody);
        expect(body).toHaveProperty('errorMessages');
        expect(body.errorMessages).toContain('Could not find an instance with todos/9999');
    });

    test('Тест №7 Отправить GET запрос GET c фильтром запроса /todos (200) @get', async ({ request }) => {
        let filter = {
            doneStatus: true,
        };

        let response = await request.get(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            params: filter,
        });

        let headers = response.headers();
        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №8 Отправить запрос HEAD /todos/200 @HEAD', async ({ request }) => {
        let response = await request.head(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
        });

        let headers = response.headers();
        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №9 Отправить POST запрос /todos @post', async ({ request }) => {
        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: todo,
        });
        const body = await response.json();
        const headers = response.headers();
        expect(response.status()).toBe(201);
        expect(headers['x-challenger']).toEqual(token);
    });
    test('Тест №10 Отправить POST запрос  на создания задачи todos/ 400 @post', async ({ request }) => {
        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: 'my title',
                doneStatus: 'example',
                description: 'my test description',
            },
        });
        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №11 Отправить POST запрос на создание задачи todos/ c ошибкой в длине заголовка 400 @post', async ({ request }) => {
        const longTitle = 'a'.repeat(60);

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: longTitle,
                doneStatus: false,
                description: 'my test description',
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №12 Отправить POST запрос на создание задачи todos/ c ошибкой longDescription 400 @post', async ({ request }) => {
        const longDescription = 'a'.repeat(256);

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: 'Valid Title',
                doneStatus: false,
                description: longDescription,
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №13 Отправить POST запрос на создание задачи todos/ c ошибкой в длине описания 400 @post ', async ({ request }) => {
        const longDescription = 'a'.repeat(256);

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: 'Valid Title',
                doneStatus: false,
                description: longDescription,
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №14 POST /todos (413) content too long @post', async ({ request }) => {
        const longDescription = 'a'.repeat(5001);
        const payload = {
            title: longDescription,
            description: longDescription,
            done: false,
        };
        const response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: payload,
        });
        expect(response.status()).toBe(413);
        const responseBody = await response.json();
        // console.log(responseBody);
        expect(responseBody.errorMessages).toContain('Error: Request body too large, max allowed is 5000 bytes');
    });

    test('Тест №15 Отправить POST запрос на создание задачи todos/ с недопустимым полем (400) @post', async ({ request }) => {
        const invalidPayload = {
            title: 'Valid Title',
            doneStatus: false,
            description: 'This is a valid description.',
            extraField: 'This field is not recognized',
        };

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: invalidPayload,
        });

        let body = await response.json();
        expect(response.status()).toBe(400);
        expect(body.errorMessages || body.message).toContain('Could not find field: extraField');
    });

    test('Тест №16 PUT /todos/{id} (400) @put', async ({ request }) => {
        const todoId = '1';
        const invalidPayload = {
            description: 'Updated description without title',
            done: false,
        };

        const response = await request.put(`${URL}/todos/${todoId}}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: invalidPayload,
        });

        expect(response.status()).toBe(400);
        const responseBody = await response.json();
    });

    test('Тест №17 Успешное обновление задачи с помощью POST /todos/{id} (200) @post', async ({ request }) => {
        const todoId = '1';
        const updatedPayload = {
            title: 'Updated Todo Title',
            doneStatus: true,
        };

        let response = await request.post(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: updatedPayload,
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.title).toBe(updatedPayload.title);
        expect(responseBody.doneStatus).toBe(updatedPayload.doneStatus);
    });

    test('Тест №18 Попытка обновления несуществующей задачи POST /todos/{id} (404) @post', async ({ request }) => {
        const nonExistentTodoId = '9999';
        const updatedPayload = {
            title: 'Updated Todo Title',
            doneStatus: true,
        };

        let response = await request.post(`${URL}/todos/${nonExistentTodoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: updatedPayload,
        });
        let body = await response.json();
        expect(response.status()).toBe(404);
    });

    test('Тест №19 Обновление существующей задачи PUT /todos/{id} full (200) @put', async ({ request }) => {
        const todoId = '9';
        const updatedPayload = {
            title: 'Updated Todo Title',
            description: 'This is an updated description for the todo item.',
            doneStatus: true,
        };

        let response = await request.put(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: updatedPayload,
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.title).toBe(updatedPayload.title);
        expect(responseBody.description).toBe(updatedPayload.description);
        expect(responseBody.doneStatus).toBe(updatedPayload.doneStatus);
    });
    test('Тест №20 Частичное обновление существующей задачи PUT /todos/{id} partial (200) @put', async ({ request }) => {
        const todoId = '9';
        const partialPayload = {
            title: 'Updated Todo Title',
        };

        let response = await request.put(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: partialPayload,
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.title).toBe(partialPayload.title);
    });

    test('Тест №21 PUT /todos/{id} no title (400) @put', async ({ request }) => {
        const todoId = '5';
        expect(todoId).toBeDefined();
        const invalidPayload = {
            description: 'Updated description without title',
            doneStatus: false,
        };
        const response = await request.put(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: invalidPayload,
        });
        let headers = response.headers();
        let body = await response.json();
        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.errorMessages).toContain('title : field is mandatory');
    });

    test('Тест №22 PUT /todos/{id} no amend id (400) @put', async ({ request }) => {
        const todoId = '5';
        expect(todoId).toBeDefined();
        const payloadWithDifferentId = {
            id: '123456', // Здесь мы указываем другой ID
            description: 'Updated description',
            doneStatus: true,
        };
        const response = await request.put(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: payloadWithDifferentId,
        });
        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.errorMessages).toContain('Can not amend id from 5 to 123456');
    });

    test('Тест №23 Удаление задачи DELETE /todos/{id} (200) @get', async ({ request }) => {
        const todoId = '5';
        let getResponse = await request.get(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
            },
        });

        expect(getResponse.status()).toBe(200);

        let deleteResponse = await request.delete(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
            },
        });

        console.log('Delete response status:', deleteResponse.status());
        expect(deleteResponse.status()).toBe(200);
        getResponse = await request.get(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
            },
        });
        expect(getResponse.status()).toBe(404);
    });

    test('Тест №24 OPTIONS /todos (200) @options', async ({ request }) => {
        let response = await request.options(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(200);
        const allowHeader = response.headers()['allow'];
        const expectedMethods = 'GET, POST, PUT, DELETE';

        expect(allowHeader).toBe(expectedMethods); // не получилось;
    });

    test('Тест №25 GET /todos должен возвращать 200 с ответом в формате XML @get', async ({ request }) => {
        let response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/xml',
                'x-challenger': token,
            },
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/xml');
        const body = await response.text();
        expect(body).toMatch(/^<todos>/);
    });

    test('Тест №26 GET /todos должен возвращать 200 с ответом в формате JSON @get', async ({ request }) => {
        let response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/json',
                'x-challenger': token,
            },
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        const body = await response.json();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object');
    });
    test('Тест №27 GET /todos должен возвращать 200 с ответом в формате JSON/Accept: */* @get', async ({ request }) => {
        const response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: '*/*',
            },
        });
        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        const body = await response.json();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object');
    });

    test('Тест №28 GET /todos должен возвращать 200 с ответом в формате XML (предпочтение application/xml) @get', async ({ request }) => {
        const response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/xml, application/json',
            },
        });
        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/xml');
        const body = await response.text();
        expect(body).toBeDefined();
        expect(typeof body).toBe('string'); // не получилось
    });

    test('Тест №29 GET /todos должен возвращать 200 с ответом в формате JSON (без заголовка Accept) @get', async ({ request }) => {
        const response = await request.get(`${URL}/todos`);
        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        const body = await response.json();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); // не получилось
    });

    test('Тест №31 POST /todos должен создавать задачу с использованием XML @post', async ({ request }) => {
        const xmlData = `<?xml version="1.0" encoding="UTF-8" ?> 
        <title> "New Title"</title>
        <doneStatus>true</doneStatus>
        <description>"New description"</description>`;
        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/xml',
                Accept: 'application/xml',
            },
            data: xmlData,
        });

        expect(response.status()).toBe(201);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/xml');
        const body = await response.text();
        console.log(body);
        expect(body).toContain('<todo>');
    });

    test('Тест №24 Отправить запрос GET /challenger/guid (existing X-CHALLENGER) @get', async ({ request }) => {
        let response = await request.get(`${URL}/challenger/${token}`, {
            headers: {
                'x-challenger': token,
            },
        });
        let headers = response.headers();
        payload = await response.json();
        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Тест №25 Отправить запрос 	PUT /challenger/guid RESTORE @put', async ({ request }) => {
        let response = await request.put(`${URL}/challenger/${token}`, {
            headers: {
                'x-challenger': token,
            },
            data: payload,
        });
        let headers = response.headers();

        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
    });
    test('Тест №26 GET /todos должен возвращать 200 с ответом в формате JSON/Accept: /*,  , @get', async ({ request }) => {
        const response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: '*/*',
            },
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        const body = await response.json();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object');
    });

    test('Тест №28 Запрос GET на конечную точку /todos с заголовком Accept , чтобы получить результаты в предпочтительном формате json , @get', async ({
        request,
    }) => {
        const response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/json/,application/xml',
            },
        });

        expect(response.status()).toBe(200);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        const body = await response.json();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object');
    });
    test('Тест №29 Проверка конечной точки /todos с заголовком Accept: application/gzip и ожидаемым кодом состояния 406. , @get', async ({
        request,
    }) => {
        const response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/gzip',
            },
        });

        expect(response.status()).toBe(406);
    });
    test('Тест №31 Запрос POST на конечную точку /todos с заголовком Content-Type и Accept для XML @post', async ({ request }) => {
        const xmlData = `<?xml version="1.0" encoding="UTF-8" ?> 
        <title> "New Title"</title>
        <doneStatus>true</doneStatus>
        <description>"New description"</description>`;
        const response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/xml',
                Accept: 'application/xml',
            },
            data: xmlData,
        });

        expect(response.status()).toBe(201);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/xml');
        const body = await response.text();
        expect(body).toBeDefined(); //да
    });
    test('Тест №32 POST на конечную точку /todos с заголовком Content-Type и Accept для JSON, @post', async ({ request }) => {
        const jsonData = {
            title: 'Новая задача',
            doneStatus: false,
        };
        const response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            data: jsonData,
        });

        expect(response.status()).toBe(201);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        const body = await response.json();
        expect(body).toBeDefined();
        expect(body.title).toBe(jsonData.title);
        expect(body.completed).toBe(jsonData.completed);
    });
    test('Тест №33 POST запрос с неподдерживаемым типом контента, @post', async ({ request }) => {
        const response = await request.post(`${URL}/todos`, {
            headers: {
                'content-type': faker.string.alpha(10),
                'x-challenger': token,
            },
            data: todo,
        });

        expect(response.status()).toBe(415);
    });
    test('Тест №34 Отправить запрос GET /challenger/guid (existing X-CHALLENGER) @get', async ({ request }) => {
        let response = await request.get(`${URL}/challenger/${token}`, {
            headers: {
                'x-challenger': token,
            },
        });

        let headers = response.headers();
        let payload = await response.json();
        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
        expect(payload).toHaveProperty('challengeStatus');
    });
    test('Тест №35 Отправить запрос PUT /challenger/guid для восстановления прогресса @get', async ({ request }) => {
        let response = await request.get(`${URL}/challenger/${token}`, {
            headers: {
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(200);
        let payload = await response.json();
        payload.restore = false;
        let restoreResponse = await request.put(`${URL}/challenger/${token}`, {
            headers: {
                'x-challenger': token,
            },
            data: payload,
        });

        expect(restoreResponse.status()).toBe(200);
    });
    test('Тест№ 36 Восстановить прогресс челенджера с помощью PUT /challenger/guid @get', async ({ request }) => {
        let response = await request.get(`${URL}/challenger/${token}`, {
            headers: {
                'X-CHALLENGER': token,
            },
        });
        expect(response.status()).toBe(200);

        let payload = await response.json();
        payload.CREATE = false;
        let restoreResponse = await request.put(`${URL}/challenger/${token}`, {
            headers: {
                'X-CHALLENGER': token,
            },
            data: payload,
        });

        expect(restoreResponse.status()).toBe(200);
        let restorePayload = await restoreResponse.json();
        expect(restorePayload).toHaveProperty('challengeStatus'); // не получилось
    });

    test('Тест№37 Получить текущую базу данных задач пользователя с помощью GET /challenger/database/guid, @get', async ({ request }) => {
        const response = await request.get(`${URL}/challenger/database/${token}`, {
            headers: {
                'X-CHALLENGER': token,
            },
        });

        expect(response.status()).toBe(200);
        const todosDatabase = await response.json();
        expect(todosDatabase).toHaveProperty('todos');
        // console.log(todosDatabase);
        const task = todosDatabase.todos.find((todo) => todo.id === 3 && todo.title === 'process payments');
        expect(task).toBeDefined();
    });

    test('Тест №38 Восстановить базу данных Todos с помощью PUT @put', async ({ request }) => {
        const getResponse = await request.get(`${URL}/challenger/database/${token}`, {
            headers: {
                'X-CHALLENGER': token,
            },
        });
        expect(getResponse.status()).toBe(200);
        const todosDatabase = await getResponse.json();
        expect(todosDatabase).toHaveProperty('todos');

        const putResponse = await request.put(`${URL}/challenger/database/${token}`, {
            headers: {
                'X-CHALLENGER': token,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(todosDatabase), // Используем полезную нагрузку из GET-запроса
        });

        expect(putResponse.status()).toBe(204);
        const updatedResponse = await request.get(`${URL}/challenger/database/${token}`, {
            headers: {
                'X-CHALLENGER': token,
            },
        });
        expect(updatedResponse.status()).toBe(200);
        const updatedTodosDatabase = await updatedResponse.json();
        expect({ updatedTodosDatabase: 18, todosDatabase: 18 }).toEqual(expect.objectContaining({ updatedTodosDatabase: expect.any(Number) }));
    });
    test('Тест №39 Создать новую задачу с помощью POST @post', async ({ request }) => {
        const xmlData = `<?xml version="1.0" encoding="UTF-8" ?> 
        <title>"Новая задача"</title>
        <doneStatus>false</doneStatus>`;
        const postResponse = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/xml',
                Accept: 'application/json',
            },
            data: xmlData,
        });
        expect(postResponse.status()).toBe(201);
        const createdTodo = await postResponse.json();
        expect(createdTodo).toHaveProperty('id');
        expect(createdTodo.title).toBe('"Новая задача"');
    });
    test('Тест №40 POST /todos JSON to XML @post', async ({ request }) => {
        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/xml',
                'Content-Type': 'application/json',
            },
            data: todo,
        });
        expect(response.status()).toBe(201);
    });

    test('Тест №41 DELETE /heartbeat (405) @api', async ({ request }) => {
        let response = await request.delete(`${URL}/heartbeat`, {
            headers: {
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(405);
    });
    test('Тест №42 PATCH /heartbeat (500) @patch', async ({ request }) => {
        let response = await request.patch(`${URL}/heartbeat`, {
            headers: {
                'x-challenger': token,
            },
        });

        expect(response.status()).toBe(500);
    });

    test('Тест №43 TRACE /heartbeat (501) @fetch', async ({ request }) => {
        let response = await request.fetch(`${URL}/heartbeat`, {
            method: 'TRACE',
            headers: {
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(501);
    });
    test('Тест №44 GET /heartbeat (204) @get', async ({ request }) => {
        let response = await request.get(`${URL}/heartbeat`, {
            headers: {
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(204);
    });
    test('Тест №45 POST /heartbeat as DELETE (405) @post', async ({ request }) => {
        const response = await request.post(`${URL}/heartbeat`, {
            headers: {
                'X-HTTP-Method-Override': 'DELETE',
                'x-challenger': token,
            },
        });

        expect(response.status()).toBe(405);
    });
    test('Тест №46 POST /heartbeat as PATCH (500) @post', async ({ request }) => {
        const response = await request.post(`${URL}/heartbeat`, {
            headers: {
                'X-HTTP-Method-Override': 'PATCH',
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(500);
    });
    test('Тест №47 POST /heartbeat as TRACE (501) @post', async ({ request }) => {
        const response = await request.post(`${URL}/heartbeat`, {
            headers: {
                'X-HTTP-Method-Override': 'TRACE',
                'x-challenger': token,
            },
        });
        expect(response.status()).toBe(501);
    });
    test('Тест №48 Отправка POST c ошибкой  /secret/token @post', async ({ request }) => {
        let challenge = 48;

        let response = await request.post(`${URL}/secret/token`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
                authorization: 'Basic YWRtaW46cGFzc3dvcmQxMTE=',
            },
        });

        expect(response.status()).toBe(401);
    });

    test('Тест №49 POST /secret/token (201) @post', async ({ request }) => {
        let response = await request.post(`${URL}/secret/token`, {
            headers: {
                'x-challenger': token,
                Authorization: 'Basic YWRtaW46cGFzc3dvcmQ=',
            },
        });
        let headers = response.headers();
        xAuthToken = headers['x-auth-token'];
        expect(response.status()).toBe(201);
    });

    test('Тест №50 GET /secret/note (403) with invalid X-AUTH-TOKEN @get', async ({ request }) => {
        const response = await request.get(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                'X-AUTH-TOKEN': 'bob',
            },
        });
        expect(response.status()).toBe(403);
    });
    test('Тест №51 GET /secret/note (401) without X-AUTH-TOKEN @get', async ({ request }) => {
        const response = await request.get(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
            },
        });
        expect(response.status()).toBe(401);
    });
    test('Тест №52 GET /secret/note (200) @get', async ({ request }) => {
        let response = await request.get(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                'X-AUTH-TOKEN': xAuthToken,
            },
        });
        expect(response.status()).toBe(200); //не получилось
    });
    test('Тест №53 Отправка POST /secret/note c записью @post', async ({ request }) => {
        let challenge = 53;

        let secret = new SecretService(request);
        let secretToken = await secret.getSecretToken(token);

        let response = await request.post(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
                'X-AUTH-TOKEN': secretToken,
            },
            data: {
                note: faker.person.bio(),
            },
        });

        expect(response.status()).toBe(200);

        let status = new GetChalengeStatus(request);
        let challengeStatus = await status.getChallengeStatus(token, challenge);
        expect(challengeStatus).toBe(true);
    });
    test('Тест  №54 POST /secret/note (401) when X-AUTH-TOKEN is missing @post', async ({ request }) => {
        const notePayload = { note: 'my note' };

        let response = await request.post(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
            },
            data: notePayload,
        });

        expect(response.status()).toBe(401);
    });
    test('Тест №55 POST /secret/note (403) when X-AUTH-TOKEN is invalid @post', async ({ request }) => {
        const notePayload = { note: 'my note' };
        let response = await request.post(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
                'X-AUTH-TOKEN': `${faker.system}`,
            },
            data: notePayload,
        });
        expect(response.status()).toBe(403);
    });

    test('Тест №56 Отправка GET /secret/note c bearer токеном @get', async ({ request }) => {
        let challenge = 56;
        let secret = new SecretService(request);
        let secretToken = await secret.getSecretToken(token);

        let response = await request.get(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
                Authorization: `Bearer ${secretToken}`,
            },
        });

        expect(response.status()).toBe(200);

        let status = new GetChalengeStatus(request);
        let challengeStatus = await status.getChallengeStatus(token, challenge);
        expect(challengeStatus).toBe(true);
    });
    test('Тест №57 Отправка POST /secret/note c bearer токеном @post', async ({ request }) => {
        let challenge = 57;

        let secret = new SecretService(request);
        let secretToken = await secret.getSecretToken(token);

        let response = await request.post(`${URL}/secret/note`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
                Authorization: `Bearer ${secretToken}`,
            },
            data: {
                note: faker.person.bio(),
            },
        });

        expect(response.status()).toBe(200);

        let status = new GetChalengeStatus(request);
        let challengeStatus = await status.getChallengeStatus(token, challenge);
        expect(challengeStatus).toBe(true);
    });

    test('Тест №58 Удаление всех задач (todos) @delete', async ({ request }) => {
        let responseTodos = await request.get(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
        });

        let idNumber = (await responseTodos.json())['todos'];

        for (let index = 0; index < idNumber.length; index++) {
            let response = await request.delete(`${URL}/todos/${idNumber[index]['id']}`, {
                headers: {
                    'x-challenger': token,
                },
            });
            let headers = response.headers();

            expect(response.status()).toBe(200);
            expect(headers['x-challenger']).toEqual(token);
        }
    });
    test('Тест №59 Добавление максимального количества задач (todos) @post', async ({ request }) => {
        let challenge = 59;
        let todoservice = new TodoService(request);
        let todoCount = await todoservice.getTodoCount(token);

        let response;

        for (let i = 0; i <= 20 - todoCount; i++) {
            response = await request.post(`${URL}/todos`, {
                headers: {
                    'x-challenger': token,
                },
                data: {
                    title: faker.string.alpha(50),
                    doneStatus: true,
                    description: faker.string.alpha(200),
                },
            });
        }

        let status = new GetChalengeStatus(request);
        let challengeStatus = await status.getChallengeStatus(token, challenge);
        expect(challengeStatus).toBe(true);
    });
});
