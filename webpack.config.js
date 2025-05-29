const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// Функция для генерации плагинов с учетом режима
const generatePlugins = (isDev) => {
  const pages = ['html', 'about'];
  
  return pages.map(page => {
    const templatePathContent = path.resolve(__dirname, `src/pages/${page}.html`);
    const templatePathHeader = path.resolve(__dirname, 'src/templates/header.html');
    const templatePathFooter = path.resolve(__dirname, 'src/templates/footer.html');

    if (!fs.existsSync(templatePathContent)) {
      console.warn(`Template ${templatePathContent} not found!`);
      return null;
    }
    
    const pageContent = fs.readFileSync(templatePathContent, 'utf-8');
    const pageHeader = fs.readFileSync(templatePathHeader, 'utf-8');
    const pageFooter = fs.readFileSync(templatePathFooter, 'utf-8');
    const title = page.charAt(0).toUpperCase() + page.slice(1);
    
    const tempTemplate = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
      </head>
      <body>
          ${pageHeader}
          <main>
              ${pageContent}
          </main>
          ${pageFooter}
      </body>
      </html>
    `;

    return new HtmlWebpackPlugin({
      filename: `${page}.html`,
      templateContent: tempTemplate,
      chunks: ['main'],
      inject: true,
      minify: !isDev
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
        ...generatePlugins(isDev),
        new CopyPlugin({
            patterns: [{
                from: 'public',
                noErrorOnMissing: true
            }]
        }),
        ...(isDev ? [] : [new CleanWebpackPlugin({ cleanStaleWebpackAssets: false })])
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
            'src/**/*.js'
        ],
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js']
    }
  };
};