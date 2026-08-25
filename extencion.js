(function (Scratch) {
    'use strict';

    const {
        BlockType,
        ArgumentType,
        Cast
    } = Scratch;

    let api_url = 'https://penguinai-proxy.onrender.com/v1';

    class PenguinAI {

        constructor() {
            this.model = 'openai/gpt-oss-120b:fastest';
        }

        getInfo() {
            return {
                id: 'penguinai',
                name: 'PenguinAI',

                color1: '#009CCC',
                color2: '#0088B5',
                color3: '#007A9E',

                blocks: [

                    {
                        opcode: 'askAI',
                        blockType: BlockType.REPORTER,
                        text: 'ask AI [PROMPT]',
                        arguments: {
                            PROMPT: {
                                type: ArgumentType.STRING,
                                defaultValue: 'Hola'
                            }
                        }
                    },

                    {
                        opcode: 'getModel',
                        blockType: BlockType.REPORTER,
                        text: 'modelo actual'
                    }

                ]
            };
        }

        getModel() {
            return this.model;
        }

        async askAI(args) {

            const prompt = Cast.toString(args.PROMPT);

            try {

                const response = await fetch(
                    api_url + '/chat/completions',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify({
                            model: this.model,
                            messages: [
                                {
                                    role: 'user',
                                    content: prompt
                                }
                            ]
                        })
                    }
                );

                const text = await response.text();

                if (!response.ok) {
                    return 'Error HTTP ' +
                        response.status +
                        ': ' +
                        text;
                }

                const data = JSON.parse(text);

                if (
                    !data.choices ||
                    !data.choices[0] ||
                    !data.choices[0].message
                ) {
                    return 'Respuesta inválida de la API.';
                }

                return String(
                    data.choices[0].message.content || ''
                );

            } catch (error) {

                return 'Error: ' +
                    String(error.message || error);
            }
        }
    }

    Scratch.extensions.register(
        new PenguinAI()
    );

})(Scratch);
