const path = require('path');
const webpack = require('webpack');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const sourcePath = path.resolve(__dirname, 'src');
const parts = require('./webpack.parts');

const PATHS = {
    app: path.join(__dirname, 'playground/app'),
    build: path.join(__dirname, 'build'),
    node_module: path.resolve(__dirname, 'node_modules'),
};

const common = merge([
    {
        entry: {
            app: ['babel-polyfill', path.join(PATHS.app, 'app.js')]
        },
        resolve: {
            alias: {
                'luna-ufo': sourcePath
            },
            extensions: [
                '.js',
            ],
        },
        output: {
            path: PATHS.build,
            filename: '[name].js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.template.ejs',
                inject: 'body',
            }),
            // new webpack.DefinePlugin({
            //     'process.env':{
            //         'NODE_ENV': JSON.stringify('production')
            //     }
            // }),
        ],
        module: {
            loaders: [
                {
                    //React-hot loader and
                    //All .js files
                    test: /\.js$/,
                    //react-hot is like browser sync and babel loads jsx and es6-7
                    loaders: ['react-hot-loader', 'babel-loader'],
                    exclude: /node_modules/,
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader',
                },
                {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader',
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    loaders: [
                        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
                        {
                            loader: 'img-loader',
                            options: {
                                enabled: process.env.NODE_ENV === 'production',
                                gifsicle: {
                                    interlaced: false
                                },
                                mozjpeg: {
                                    progressive: true,
                                    arithmetic: false
                                },
                                optipng: false, // disabled
                                pngquant: false,
                                svgo: {
                                    plugins: [
                                        { removeTitle: true },
                                        { convertPathData: false }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: 'file-loader?name=public/fonts/[name].[ext]'
                }
            ],
        },
    },
]);

function production() {
    return merge([
        common,
        {
            performance: {
                hints: 'warning', // 'error' or false are valid too
                maxEntrypointSize: 10000000, // in bytes
                maxAssetSize: 10000000, // in bytes
            },
            output: {
                chunkFilename: '[chunkhash].js',
                filename: '[name].[chunkhash].js',
            },
            plugins: [
                new webpack.HashedModuleIdsPlugin(),
                new TransferWebpackPlugin([
                    {from: 'www'},
                ], path.resolve(__dirname,"playground")),
            ],
            recordsPath: path.resolve(__dirname,"records.json"),
        },
        parts.clean(PATHS.build),
    ])
}

function development() {
    return merge([
        common,
        {
            output: {
                devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
            },
            plugins: [
                new webpack.NamedModulesPlugin(),
            ],
        },
        parts.devServer({
            // 개발 서버 설정
            host: 'localhost',
            port: 5000
        }),
        parts.generateSourceMaps({ type: 'eval' }),
    ])
}
module.exports = function(env) {
    if(env === 'product' || env === 'production') {
        return production();
    }
    return development();
};