const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');



const generatePages = (isDev) => {
  const pages = ['html', 'about'];
  
  return pages.map(page => {
    const templatePathContent = path.resolve(__dirname, `src/pages/${page}.html`);

    if (!fs.existsSync(templatePathContent)) {
      console.warn(`Template ${templatePathContent} not found!`);
      return null;
    }

    return new HtmlWebpackPlugin({
      filename: `pages/${page}.html`,
      template: 'src/templates/index.ejs',
      cache: true,
      chunks: ['main'],
      inject: true,
      minify: !isDev,
      templateParameters: {
        header: fs.readFileSync('src/templates/header.html', 'utf8'),
        content: fs.readFileSync(templatePathContent, 'utf8'),
        footer: fs.readFileSync('src/templates/footer.html', 'utf8')
      }
    });
  }).filter(Boolean);
};

module.exports = (env) => {
  const isDev = env.development;
  
  return {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'inline-source-map' : false,
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        assetModuleFilename: 'assets/[hash][ext]'
    },
    plugins: [
        ...(isDev ? [] : [new ESLintPlugin({ extensions: ['js'] })]),
        new MiniCssExtractPlugin({ 
            filename: isDev ? '[name].css' : '[name].[contenthash].css'
        }),
        new HtmlWebpackPlugin({
      filename: `index.html`,
      template: 'src/index.html',
      chunks: ['main'],
      inject: true,
      minify: !isDev
    }),
        ...generatePages(isDev),
        new CopyPlugin({
            patterns: [{
                from: 'public',
                noErrorOnMissing: true
            }]
        }),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
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
                use: [
                    isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    devServer: {
        open: true,
        hot: true,
        liveReload: true,
        port: 8080,
        static: {
            directory: path.join(__dirname, 'dist'),
            watch: true
        },
        watchFiles: [
            'src/**/*.html',
            'src/**/*.scss',
            'src/**/*.ejs',
            'src/**/*.js'
        ],
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js']
    }
  };
};