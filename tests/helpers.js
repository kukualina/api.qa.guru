import { faker } from '@faker-js/faker';

export class GetChalengeStatus {
    constructor(request) {
        this.request = request;
        //    this.challengeStatusRequest = challengeStatusRequest
    }

    async getChallengeStatus(token, challenge) {
        let challengeStatusRequest = await this.request.get('https://apichallenges.herokuapp.com/challenges', {
            headers: {
                'x-challenger': token,
            },
        });

        let challengeStatus = await challengeStatusRequest.json();
        return challengeStatus.challenges[challenge - 1].status;
    }
}

export class TodoService {
    constructor(request) {
        this.request = request;
    }

    async getRandomTodo(token) {
        let todoListRequest = await this.request.get(`https://apichallenges.herokuapp.com/todos`, {
            headers: {
                'x-challenger': token,
            },
        });

        let body = await todoListRequest.json();
        return body.todos[faker.number.int(body.todos.length - 1)];
    }

    async getTodoCount(token) {
        let todoListRequest = await this.request.get(`https://apichallenges.herokuapp.com/todos`, {
            headers: {
                'x-challenger': token,
            },
        });

        let body = await todoListRequest.json();
        return body.todos.length;
    }

    async getTodoList(token) {
        let todoListRequest = await this.request.get(`https://apichallenges.herokuapp.com/todos`, {
            headers: {
                'x-challenger': token,
            },
        });

        let body = await todoListRequest.json();
        return body.todos;
    }
}

export class SecretService {
    constructor(request) {
        this.request = request;
    }

    async getSecretToken(token) {
        let secretRequest = await this.request.post(`https://apichallenges.herokuapp.com/secret/token`, {
            headers: {
                'x-challenger': token,
                Accept: 'application/json',
                authorization: 'Basic YWRtaW46cGFzc3dvcmQ=',
            },
        });

        let secretBody = await secretRequest.headers();
        return secretBody['x-auth-token'];
    }
}
