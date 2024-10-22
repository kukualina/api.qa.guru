import { test, expect } from '@playwright/test';
import { request } from 'http';
const { faker } = require('@faker-js/faker');

test.describe('API challenge', () => {
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
        // Пример ассерта
        expect(headers).toEqual(expect.objectContaining({ 'x-challenger': expect.any(String) }));
        console.log(token);
    });
    // Тест для получения списка заданий
    test('Получить список заданий/get/200 @GET', async ({ request }) => {
        let response = await request.get(`${URL}/challenges`, {
            headers: {
                'x-challenger': token,
            },
        });
        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200); // проверяем код ответа
        expect(headers).toEqual(expect.objectContaining({ 'x-challenger': token }));
        expect(body.challenges.length).toBe(59);
    });
    test('Получить спиок /todos/get/200 @GET', async ({ request }) => {
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
    });
    test('Отправить запрос GET на не существующий объект /todos/404 @GET', async ({ request }) => {
        let id = 17;
        let response = await request.get(`${URL}/todos/${id}`, {
            headers: {
                'x-challenger': token,
            },
        });

        let headers = response.headers();
        let body = await response.json();
        console.log(body);
        expect(response.status()).toBe(404);
        expect(headers['x-challenger']).toEqual(token);
        expect(body.errorMessages || body.message).toContain('Could not find an instance with todos/17');
    });

    test('Отправить GET  запрос на существующий объект /todos/{id}/200 @GET', async ({ request }) => {
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

    test('Отправить GET запрос GET c фильтром запроса /todos (200) @GET', async ({ request }) => {
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

    test('Отправить запрос HEAD /todos/200 @HEAD', async ({ request }) => {
        let response = await request.head(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
        });

        let headers = response.headers();
        expect(response.status()).toBe(200);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Отправить POST запрос /todos @POST', async ({ request }) => {
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
    test('Отправить POST запрос  на создания задачи todos/ 400 @POST', async ({ request }) => {
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

    test('Отправить POST запрос на создание задачи todos/ c ошибкой в длине заголовка 400 @POST', async ({ request }) => {
        // Создаем заголовок, превышающий максимальную длину
        const longTitle = 'a'.repeat(60); // Заголовок из 60 символов

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: longTitle, // Используем длинный заголовок
                doneStatus: false,
                description: 'my test description',
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Отправить POST запрос на создание задачи todos/ c ошибкой longDescription 400 @POST', async ({ request }) => {
        // Создаем описание, превышающее максимальную длину
        const longDescription = 'a'.repeat(256); // Предположим, что максимальная длина 255 символов

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: 'Valid Title', // Заголовок корректной длины
                doneStatus: false,
                description: longDescription, // Используем длинное описание
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
    });

    test('Отправить POST запрос на создание задачи todos/ c ошибкой в длине описания 400 @POST', async ({ request }) => {
        // Создаем описание, превышающее максимальную длину
        const longDescription = 'a'.repeat(256); // Предположим, что максимальная длина 255 символов

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: 'Valid Title', // Заголовок корректной длины
                doneStatus: false,
                description: longDescription, // Используем длинное описание
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(400);
        expect(headers['x-challenger']).toEqual(token);
        expect(body).toHaveProperty('error'); // Проверка наличия поля ошибки в ответе
        expect(body.error).toContain('длина'); // Проверка, что сообщение об ошибке связано с длиной
    });

    test('Отправить POST запрос на создание задачи todos/ с максимальной длиной заголовка и описания 201 @POST', async ({ request }) => {
        // Максимальная длина заголовка и описания
        const maxLengthTitle = 'a'.repeat(255); // Предположим, что максимальная длина заголовка 255 символов
        const maxLengthDescription = 'b'.repeat(255); // Предположим, что максимальная длина описания 255 символов

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
            },
            data: {
                title: maxLengthTitle, // Заголовок максимальной длины
                doneStatus: false,
                description: maxLengthDescription, // Описание максимальной длины
            },
        });

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(201); // Проверка, что статус 201 (создано)
        expect(headers['x-challenger']).toEqual(token);
        expect(body).toHaveProperty('id'); // Проверка наличия поля id в ответе
        expect(body.title).toEqual(maxLengthTitle); // Проверка, что заголовок соответствует отправленному
        expect(body.description).toEqual(maxLengthDescription); // Проверка, что описание соответствует отправленному
    });

    test('Отправить POST запрос на создание задачи todos/ с допустимой длиной заголовка и описания 201 @POST', async ({ request }) => {
        const validTitle = 'a'.repeat(50); // Задаем длинну заголовка
        const validDescription = 'b'.repeat(50); // Задаем длинну описания

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json', // Добавляем заголовок Content-Type
            },
            data: {
                title: validTitle,
                doneStatus: false,
                description: validDescription,
            },
        });

        console.log('Response status:', response.status());
        console.log('Response body:', await response.json());

        const body = await response.json();
        const headers = response.headers();

        expect(response.status()).toBe(201);
        expect(headers['x-challenger']).toEqual(token);
        expect(body).toHaveProperty('id');
        expect(body.title).toEqual(validTitle);
        expect(body.description).toEqual(validDescription);
    });

    test('Отправить POST запрос на создание задачи todos/ с превышением максимальной длины 5000 символов (413)/@POST', async ({ request }) => {
        const longTitle = 'a'.repeat(5000); // Создаем строку длиной 5000 символов
        const validDescription = 'This is a valid description.';
        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: {
                title: longTitle,
                doneStatus: false,
                description: validDescription,
            },
        });

        let body = await response.json();
        expect(response.status()).toBe(413);
        expect(body.errorMessages || body.message).toContain('Error: Request body too large, max allowed is 5000 bytes');
    });
    test('Отправить POST запрос на создание задачи todos/ с недопустимым полем (400) @POST', async ({ request }) => {
        const invalidPayload = {
            title: 'Valid Title',
            doneStatus: false,
            description: 'This is a valid description.',
            extraField: 'This field is not recognized', // Недопустимое поле
        };

        let response = await request.post(`${URL}/todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: invalidPayload,
        });

        //console.log('Response status:', response.status());
        let body = await response.json();
        //console.log('Response body:', await response.json());
        expect(response.status()).toBe(400);
        expect(body.errorMessages || body.message).toContain('Could not find field: extraField');
    });
    test('Отправить PUT запрос на обновление задачи todos/{id} с недопустимым полем (400) @PUT', async ({ request }) => {
        const todoId = '1'; // Замените на актуальный ID задачи
        const invalidPayload = {
            title: 'Updated Title',
            doneStatus: true,
            extraField: 'This field is not recognized', // Недопустимое поле
        };

        let response = await request.put(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: invalidPayload,
        });
        let body = await response.json();

        console.log('Response status:', response.status());
        console.log('Response body:', await response.json());
        expect(body.errorMessages || body.message).toContain('Could not find field: extraField');
        expect(response.status()).toBe(400);
    });

    test('Успешное обновление задачи с помощью POST /todos/{id} (200) @POST', async ({ request }) => {
        const todoId = '1'; //ID Задачи
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

        console.log('Response status:', response.status());
        console.log('Response body:', await response.json());

        // Проверяем, что статус ответа 200
        expect(response.status()).toBe(200);
        // проверка на то, что  ответ содержит обновленные данные
        const responseBody = await response.json();
        expect(responseBody.title).toBe(updatedPayload.title);
        expect(responseBody.doneStatus).toBe(updatedPayload.doneStatus);
    });

    test('Попытка обновления несуществующей задачи POST /todos/{id} (404) @POST', async ({ request }) => {
        const nonExistentTodoId = '9999'; // ID несуществующей задачи
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

        console.log('Response status:', response.status());
        console.log('Response body:', await response.json());
        expect(response.status()).toBe(404);
    });

    test('Обновление существующей задачи PUT /todos/{id} full (200) @PUT', async ({ request }) => {
        const todoId = '9'; // ID существующей задачи
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

        console.log('Response status:', response.status());
        console.log('Response body:', await response.json());

        expect(response.status()).toBe(200);
        // Проверяем, что ответ содержит обновленные данные
        const responseBody = await response.json();
        expect(responseBody.title).toBe(updatedPayload.title);
        expect(responseBody.description).toBe(updatedPayload.description);
        expect(responseBody.doneStatus).toBe(updatedPayload.doneStatus);
    });
    test('Частичное обновление существующей задачи PUT /todos/{id} partial (200) @PUT', async ({ request }) => {
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

        console.log('Response status:', response.status());
        console.log('Response body:', await response.json());

        expect(response.status()).toBe(200);
        // Проверяем, что ответ содержит обновленные данные
        const responseBody = await response.json();
        expect(responseBody.title).toBe(partialPayload.title);
    });

    test('Удаление задачи DELETE /todos/{id} (200) @GET', async ({ request }) => {
        const todoId = '5'; // ID задачи, которую нужно удалить

        // Сначала убедимся, что задача существует
        let getResponse = await request.get(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
            },
        });

        expect(getResponse.status()).toBe(200); // Убедимся, что задача существует перед удалением

        // Выполняем DELETE-запрос
        let deleteResponse = await request.delete(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
            },
        });

        console.log('Delete response status:', deleteResponse.status());

        // Проверяем статус ответа
        expect(deleteResponse.status()).toBe(200);

        // Проверяем, что задача действительно удалена
        getResponse = await request.get(`${URL}/todos/${todoId}`, {
            headers: {
                'x-challenger': token,
            },
        });
        //Ожидаем статус 404, так как задача должна быть удалена
        expect(getResponse.status()).toBe(404);
    });

    test('OPTIONS /todos (200) @OPTIONS', async ({ request }) => {
        // Выполнение OPTIONS-запроса на эндпоинт /todos
        let response = await request.options(`${URL}/todos`, {
            headers: {
                'x-challenger': token, // Замените на ваш токен, если требуется
            },
        });

        console.log('Response status:', response.status());
        console.log('Response headers:', response.headers());
        expect(response.status()).toBe(200);
        // Проверка заголовка 'Allow' на наличие ожидаемых методов
        const allowHeader = response.headers()['allow'];
        const expectedMethods = 'GET, POST, PUT, DELETE'; // Замените на ожидаемые методы

        expect(allowHeader).toBe(expectedMethods);
    });

    test('GET /todos должен возвращать 200 с ответом в формате XML @GET', async ({ request }) => {
        // Выполнение GET-запроса с заголовком Accept
        let response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/xml', // Указываем заголовок Accept
                'x-challenger': token, // Заголовок с токеном
            },
        });
        // Проверка статуса ответа
        expect(response.status()).toBe(200);

        // Проверка заголовка Content-Type
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/xml');

        // Проверка, что тело ответа является валидным XML
        const body = await response.text();
        expect(body).toMatch(/^<todos>/); // Проверяем, что тело начинается с <todos>
    });

    test.only('GET /todos должен возвращать 200 с ответом в формате JSON @GET', async ({ request }) => {
        // Выполнение GET-запроса с заголовком Accept
        let response = await request.get(`${URL}/todos`, {
            headers: {
                Accept: 'application/json', // Указываем заголовок Accept
                'x-challenger': token, // Заголовок с токеном
            },
        });

        expect(response.status()).toBe(200);
        // Проверка заголовка Content-Type
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        // Проверка, что тело ответа является валидным JSON
        const body = await response.json();
        expect(body).toBeDefined(); // Проверяем, что тело не пустое
        expect(typeof body).toBe('object');
    });

    test('POST /todos должен создавать задачу с использованием XML @GET', async ({ request }) => {
        // XML-данные для создания задачи
        const xmlData = (
            <todo>
                <title>Новая задача</title>
                <completed>false</completed>
            </todo>
        );
        let response = await request.get(`${URL}/todos`, {
            headers: {
                'Content-Type': 'application/xml', // Указываем заголовок Content-Type
                Accept: 'application/xml', // Указываем заголовок Accept
                'x-challenger': token, // Заголовок с токеном
            },
            data: xmlData,
        });

        expect(response.status()).toBe(200);
        // Проверка заголовка Content-Type в ответе
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/xml');
        // Проверка, что тело ответа является валидным XML
        const body = await response.text(); // Получаем тело ответа как текст
        console.log(body); // Выводим тело ответа для отладки
        expect(body).toContain('<todo>'); // Проверяем, что в ответе есть корневой элемент <todo>
        expect(body).toContain('<title>Новая задача</title>'); // Проверяем наличие заголовка задачи
    });

    test('Отправить запрос GET /challenger/guid (existing X-CHALLENGER) @GET', async ({ request }) => {
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

    test.only('Отправить запрос 	PUT /challenger/guid RESTORE @GET', async ({ request }) => {
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
});
