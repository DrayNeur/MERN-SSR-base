const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { SubresourceIntegrityPlugin } = require("webpack-subresource-integrity");
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;

console.log(process.env.NODE_ENV);
const frontConfig = {
  mode: ('development' === process.env.NODE_ENV ? 'development' : 'production'),
  entry: './src/js/index.js',
  module: {
    rules: [
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: 'url-loader',
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              '@babel/preset-env', {
                targets: {
                  esmodules: true
                }
              }],
              '@babel/preset-react']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'build/styles.css'
    }),

    new HTMLWebpackPlugin({
      filename: 'index.dat',
      template: path.resolve(__dirname, 'src/index.html'),
      minify: !('development' === process.env.NODE_ENV)
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, 'public')
        }
      ]
    }),
    new SubresourceIntegrityPlugin(),
    new CspHtmlWebpackPlugin({
      'base-uri': "'self'",
      'object-src': "'none'",
      'script-src': ["'self'"],
      'style-src': ["'self'"]
    }, {
      enabled: true,
      hashingMethod: 'sha256',
      hashEnabled: {
        'script-src': true,
        'style-src': true
      },
      nonceEnabled: {
        'script-src': true,
        'style-src': true
      }
    }),
    new SitemapPlugin({
      base: 'https://mysite.com',
      paths: [
        "/lmao/"
      ],
      options: {
        filename: 'sitemap.xml',
        lastmod: true,
        changefreq: 'monthly',
        priority: 0.8
      }
    })
  ],
  resolve: {
    extensions: ['.js'],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,

        vendor: {
          chunks: 'all', // both : consider sync + async chunks for evaluation
          name: 'vendor', // name of chunk file
          test: /node_modules/, // test regular expression
        }
      }
    }
  },
  output: {
    crossOriginLoading: "anonymous",
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },
};

const backendConfig = {
  entry: './server.js',
  mode: ('development' === process.env.NODE_ENV ? 'development' : 'production'),
  target: 'node',
  module: {
    rules: [
      { test: /\.scss$/, loader: 'css-loader' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-transform-async-to-generator',
              '@babel/transform-arrow-functions',
              '@babel/proposal-object-rest-spread',
              '@babel/proposal-class-properties'
            ]
          }
        }
      },
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'server.dist.js',
  },
};

module.exports = [frontConfig, backendConfig];