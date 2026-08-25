(function (Scratch) {
    'use strict';

    class PenguinAI {
        getInfo() {
            return {
                id: 'penguinGPT',
                name: 'PenguinAI',
                color1: '#009CCC',
                color2: '#0088B5',
                color3: '#007A9E',

                blocks: [
                    {
                        opcode: 'test',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'PenguinAI funciona'
                    }
                ]
            };
        }

        test() {
            return '¡PenguinAI funciona!';
        }
    }

    Scratch.extensions.register(new PenguinAI());

})(Scratch);