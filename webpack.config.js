const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const devServer = (isDev) => !isDev
    ? {}
    : {
        devServer: {
            open: true,
            hot: true,
            port: 8080

        }
    };

const esLintPlugin = (isDev) => isDev ? [] : [new ESLintPlugin({ extensions: ['js'] })];
process.traceDeprecation = true;
module.exports = ({ development }) => ({
    mode: development ? 'development' : 'production',
    devtool: development ? 'inline-source-map' : false,
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        assetModuleFilename: 'assets/[hash][ext]'
    },
    plugins: [
        ...esLintPlugin(development),
        new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new CopyPlugin({
            patterns: [{
                from: 'public',
                noErrorOnMissing: true
            }]
        }),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false })
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: false }
                    }
                ]
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf)$/i,
                type: 'asset/inline'
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    
    resolve: {
        extensions: ['.js']
    },
    ...devServer(development)
});