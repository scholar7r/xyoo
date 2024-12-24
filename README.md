# Xyoo <sub>Client for XiaoYouBang</sub>

## 1. Project Structure

```
.
├── LICENSE
├── README.md
├── package.json
├── pnpm-lock.yaml
├── src                          Work Directory
│   ├── domains                  Domains Directory
│   │   └── Configuration.ts     Configuration File Reader
│   ├── Main.ts                  Main
│   └── services                 Services Directory
│       ├── Endpoints.ts         Endpoint interface, urls and functions
│       ├── Mstv.ts              Mstv algorithm for XiaoYouBang
│       ├── Mstv.ts.archived     Refactor of Mstv, but not able to use
│       └── XyooAxios.ts         Wrappered Axios client
├── tsconfig.json
└── xyoo.yaml                    Default configuration for Xyoo
```

## 2. Installation

Clone **Xyoo** repository from GitHub by using command below.

```
git clone https://github.com/scholar7r/xyoo.git
```

More installation way will be here when **Xyoo** published.

## 3. Usage

When Xyoo installed to your computer, you should install dependencies defined in `package.json`,
if you installed npm, pnpm, yarn, or other node package manager in your computer, you should run
commands below to install dependencies.

```
# For npm
npm install

# For pnpm
pnpm install

# For yarn
yarn install
```

After installed them, you can run scripts defined.

**Sciprts Manual**

|         Script          |  For what   |
| :---------------------: | :---------: |
| dev <command> [options] | Run program |

| Command |       For what        |
| :-----: | :-------------------: |
|   in    | Run clock-in process  |
|   out   | Run clock-out process |
|  mamba  |     Alias of out      |

|       Option        |                     For what                      |
| :-----------------: | :-----------------------------------------------: |
|    -t <filename>    | Select target configuration file to run processes |
| --target <filename> |                    Alias of -t                    |

# FaQ

1. Insecure login

Due to the XiaoYouBang applet server changed it's logic to identify user's status,
you should run XiaoYouBang applet before 8-12 hours.

Copyright (c) 2024 scholar7r. All Rights Reserved.
