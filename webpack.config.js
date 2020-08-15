const { resolve } = require('path');

const config = {
    entry: resolve(process.cwd(), './index.js'),
    module: {
        rules: [
            {
                test: /\.js$/u,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            [
                                '@babel/plugin-proposal-class-properties',
                                {
                                    loose: true
                                }
                            ]
                        ],
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    output: {
        filename: 'bundle.min.js',
        path: resolve(process.cwd(), 'dist')
    }
};

module.exports = config;
