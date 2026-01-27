/**
 * INTEGRATION REPORT GENERATOR
 * Comprehensive analysis of project readiness
 * Run with: node GENERATE_REPORT.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

class IntegrationReport {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      projectStatus: 'READY_FOR_TESTING',
      sections: {},
      summary: {},
    };
  }

  // 1. File Structure Analysis
  checkFileStructure() {
    console.log('\n📁 Checking File Structure...');
    const requiredFiles = {
      'Backend': {
        './server.js': 'Main server file',
        './src/config/database.js': 'Database configuration',
        './src/config/environment.js': 'Environment variables',
        './src/middleware/auth.js': 'Authentication middleware',
        './src/routes/auth.js': 'Auth routes',
        './src/routes/screener.js': 'Screener routes',
        './src/routes/market_data.js': 'Market data routes',
        './src/routes/alerts.js': 'Alerts routes',
        './src/services/auth/auth_service.js': 'Auth service',
        './src/services/screener/screener_runner.js': 'Screener runner',
        './package.json': 'Backend dependencies',
      },
      'Frontend': {
        '../frontend/App.js': 'Main frontend app',
        '../frontend/src/context/AuthContext.js': 'Auth context',
        '../frontend/src/services/http.js': 'HTTP helper',
        '../frontend/src/services/authService.js': 'Auth service',
        '../frontend/src/screens/auth/LoginScreen.js': 'Login screen',
        '../frontend/src/screens/auth/RegisterScreen.js': 'Register screen',
        '../frontend/src/screens/screener/ScreenerQueryScreen.js': 'Screener screen',
        '../frontend/src/screens/portfolio/PortfolioScreen.js': 'Portfolio screen',
        '../frontend/src/screens/watchlist/WatchlistScreen.js': 'Watchlist screen',
        '../frontend/package.json': 'Frontend dependencies',
      },
      'Database': {
        './database/schema.sql': 'Database schema',
        './database/setup_database.js': 'Database setup',
      },
      'Documentation': {
        '../docs/API_DOCUMENTATION.md': 'API docs',
        '../docs/DATABASE_SCHEMA.md': 'DB schema docs',
        '../docs/SETUP_GUIDE.md': 'Setup guide',
        '../docs/ARCHITECTURE.md': 'Architecture docs',
      },
    };

    const fileStatus = {};
    let totalFiles = 0;
    let foundFiles = 0;

    for (const [category, files] of Object.entries(requiredFiles)) {
      fileStatus[category] = {};
      for (const [filePath, description] of Object.entries(files)) {
        totalFiles++;
        const fullPath = path.join(__dirname, filePath);
        const exists = fs.existsSync(fullPath);
        fileStatus[category][filePath] = exists;
        if (exists) foundFiles++;
        const status = exists ? '✅' : '❌';
        console.log(`${status} ${description} (${filePath})`);
      }
    }

    this.report.sections.fileStructure = {
      status: foundFiles === totalFiles ? 'COMPLETE' : 'INCOMPLETE',
      totalFiles,
      foundFiles,
      percentage: Math.round((foundFiles / totalFiles) * 100),
      files: fileStatus,
    };

    return foundFiles === totalFiles;
  }

  // 2. Environment Configuration
  checkEnvironment() {
    console.log('\n⚙️  Checking Environment Configuration...');
    const required = {
      'DB_HOST': 'Database hostname',
      'DB_PORT': 'Database port',
      'DB_NAME': 'Database name',
      'DB_USER': 'Database user',
      'DB_PASSWORD': 'Database password',
      'JWT_SECRET': 'JWT secret key',
      'TWELVE_DATA_API_KEY': 'Market data API key',
      'PORT': 'Server port',
      'NODE_ENV': 'Environment',
    };

    const envStatus = {};
    let foundVars = 0;

    for (const [envVar, description] of Object.entries(required)) {
      const value = process.env[envVar];
      const exists = !!value;
      envStatus[envVar] = exists;
      if (exists) foundVars++;

      const status = exists ? '✅' : '⚠️ ';
      const displayValue =
        envVar.includes('PASSWORD') || envVar.includes('SECRET')
          ? '***' + (value?.substring(value.length - 3) || '')
          : value || 'NOT SET';
      console.log(`${status} ${description}: ${displayValue}`);
    }

    this.report.sections.environment = {
      status: foundVars === Object.keys(required).length ? 'COMPLETE' : 'PARTIAL',
      totalRequired: Object.keys(required).length,
      found: foundVars,
      percentage: Math.round((foundVars / Object.keys(required).length) * 100),
      variables: envStatus,
    };

    return foundVars >= Object.keys(required).length - 2; // Allow 2 missing
  }

  // 3. Dependencies
  checkDependencies() {
    console.log('\n📦 Checking Dependencies...');
    try {
      const pkgJsonPath = path.join(__dirname, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

      const requiredDeps = [
        'express',
        'pg',
        'jsonwebtoken',
        'bcryptjs',
        'cors',
        'helmet',
        'dotenv',
        'morgan',
        'axios',
        'node-cron',
      ];

      const installed = {};
      let count = 0;

      for (const dep of requiredDeps) {
        const found = !!pkg.dependencies[dep];
        installed[dep] = found;
        if (found) count++;
        const status = found ? '✅' : '❌';
        console.log(`${status} ${dep} (${pkg.dependencies[dep] || 'NOT INSTALLED'})`);
      }

      this.report.sections.dependencies = {
        status: count === requiredDeps.length ? 'COMPLETE' : 'INCOMPLETE',
        totalRequired: requiredDeps.length,
        installed: count,
        percentage: Math.round((count / requiredDeps.length) * 100),
        dependencies: installed,
      };

      return count === requiredDeps.length;
    } catch (error) {
      console.error('❌ Error reading package.json:', error.message);
      return false;
    }
  }

  // 4. Database Configuration
  async checkDatabase() {
    console.log('\n🗄️  Checking Database Configuration...');
    try {
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'stock_screener',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        connectionTimeoutMillis: 5000,
      });

      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
      console.log('   Connected at:', result.rows[0].now);

      // Check tables
      const tablesResult = await pool.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );
      const tableCount = tablesResult.rows.length;
      console.log(`✅ Found ${tableCount} tables`);

      // Check critical tables
      const requiredTables = ['users', 'companies', 'price_history', 'technical_indicators_latest'];
      const tableNames = tablesResult.rows.map((r) => r.table_name);

      const allPresent = requiredTables.every((t) => tableNames.includes(t));
      if (allPresent) {
        console.log('✅ All critical tables present');
      } else {
        console.log('⚠️  Some tables missing');
      }

      await pool.end();

      this.report.sections.database = {
        status: 'CONNECTED',
        tableCount,
        hasRequiredTables: allPresent,
        tables: tableNames,
      };

      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.report.sections.database = {
        status: 'DISCONNECTED',
        error: error.message,
      };
      return false;
    }
  }

  // 5. Code Quality
  checkCodeQuality() {
    console.log('\n🔍 Checking Code Quality...');

    const serviceFiles = [
      './src/services/auth/auth_service.js',
      './src/services/screener/screener_runner.js',
      './src/services/market_data/twelve_data_service.js',
      './src/config/database.js',
    ];

    let totalErrors = 0;
    const fileQuality = {};

    for (const filePath of serviceFiles) {
      try {
        const fullPath = path.join(__dirname, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Basic checks
        const hasErrors = content.includes('throw new Error') || content.includes('error');
        const hasLogging = content.includes('logger');
        const hasDocumentation = content.includes('/**') || content.includes('/*');

        fileQuality[filePath] = {
          hasErrorHandling: hasErrors,
          hasLogging,
          hasDocumentation,
          lineCount: content.split('\n').length,
        };

        console.log(`✅ ${filePath} (${content.split('\n').length} lines, documented: ${hasDocumentation})`);
      } catch (error) {
        console.error(`❌ Error reading ${filePath}`);
        totalErrors++;
      }
    }

    this.report.sections.codeQuality = {
      status: totalErrors === 0 ? 'GOOD' : 'ISSUES',
      filesAnalyzed: serviceFiles.length,
      files: fileQuality,
    };

    return totalErrors === 0;
  }

  // 6. API Endpoints
  checkAPIEndpoints() {
    console.log('\n🔗 Checking API Endpoint Definitions...');

    const endpoints = {
      'POST /api/v1/auth/register': 'User registration',
      'POST /api/v1/auth/login': 'User login',
      'GET /api/v1/auth/me': 'Get current user',
      'POST /api/v1/screener/run': 'Run screener',
      'GET /api/v1/screener/metadata': 'Get screener metadata',
      'GET /api/v1/market/quote/:symbol': 'Get quote',
      'GET /api/v1/market/timeseries/:symbol': 'Get time series',
      'POST /api/v1/alerts/create': 'Create alert',
      'GET /health': 'Health check',
    };

    const routeFiles = [
      './src/routes/auth.js',
      './src/routes/screener.js',
      './src/routes/market_data.js',
      './src/routes/alerts.js',
      './server.js',
    ];

    const foundEndpoints = {};
    let count = 0;

    for (const [endpoint, description] of Object.entries(endpoints)) {
      let found = false;
      const [method, path] = endpoint.split(' ');

      for (const routeFile of routeFiles) {
        try {
          const fullPath = path.join(__dirname, routeFile);
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (
              content.includes(`'${path.split('/').pop()}'`) ||
              content.includes(`"${path}"`) ||
              content.includes(path.split('/').pop())
            ) {
              found = true;
              break;
            }
          }
        } catch (e) {
          // Continue
        }
      }

      foundEndpoints[endpoint] = found;
      if (found) count++;
      const status = found ? '✅' : '⚠️ ';
      console.log(`${status} ${endpoint}: ${description}`);
    }

    this.report.sections.apiEndpoints = {
      status: count === Object.keys(endpoints).length ? 'COMPLETE' : 'PARTIAL',
      total: Object.keys(endpoints).length,
      found: count,
      percentage: Math.round((count / Object.keys(endpoints).length) * 100),
      endpoints: foundEndpoints,
    };

    return count >= Object.keys(endpoints).length - 2;
  }

  // 7. Frontend Integration
  checkFrontendIntegration() {
    console.log('\n📱 Checking Frontend Integration...');

    const frontendFiles = [
      '../frontend/src/services/http.js',
      '../frontend/src/services/authService.js',
      '../frontend/src/context/AuthContext.js',
      '../frontend/src/screens/auth/LoginScreen.js',
      '../frontend/src/screens/auth/RegisterScreen.js',
      '../frontend/src/screens/screener/ScreenerQueryScreen.js',
    ];

    let found = 0;
    for (const file of frontendFiles) {
      const fullPath = path.join(__dirname, file);
      const exists = fs.existsSync(fullPath);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${file}`);
      if (exists) found++;
    }

    this.report.sections.frontendIntegration = {
      status: found === frontendFiles.length ? 'COMPLETE' : 'INCOMPLETE',
      total: frontendFiles.length,
      found,
      percentage: Math.round((found / frontendFiles.length) * 100),
    };

    return found === frontendFiles.length;
  }

  // Generate Summary
  generateSummary() {
    const sections = this.report.sections;

    const scores = {
      fileStructure: sections.fileStructure?.percentage || 0,
      environment: sections.environment?.percentage || 0,
      dependencies: sections.dependencies?.percentage || 0,
      apiEndpoints: sections.apiEndpoints?.percentage || 0,
      frontendIntegration: sections.frontendIntegration?.percentage || 0,
      codeQuality: sections.codeQuality?.status === 'GOOD' ? 100 : 70,
    };

    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    this.report.summary = {
      overallScore: Math.round(overallScore),
      scoreBreakdown: scores,
      readinessLevel:
        overallScore >= 95
          ? 'PRODUCTION_READY'
          : overallScore >= 85
            ? 'READY_FOR_TESTING'
            : overallScore >= 70
              ? 'IN_DEVELOPMENT'
              : 'NEEDS_WORK',
      timestamp: new Date().toISOString(),
    };
  }

  // Print Final Report
  printReport() {
    const { summary } = this.report;

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║        INTEGRATION READINESS REPORT            ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log(`📊 Overall Score: ${summary.overallScore}%`);
    console.log(`🎯 Readiness Level: ${summary.readinessLevel}`);
    console.log('\n📈 Component Scores:');

    for (const [component, score] of Object.entries(summary.scoreBreakdown)) {
      const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));
      console.log(`   ${component.padEnd(25)} [${bar}] ${score}%`);
    }

    if (summary.readinessLevel === 'PRODUCTION_READY') {
      console.log(
        '\n✅ EXCELLENT! The project is fully integrated and ready for real-time testing.\n'
      );
    } else if (summary.readinessLevel === 'READY_FOR_TESTING') {
      console.log(
        '\n✅ GOOD! The project is well-integrated and ready for testing.\n'
      );
    } else {
      console.log(
        '\n⚠️  Please review the issues above before testing.\n'
      );
    }
  }

  // Save Report
  saveReport() {
    const reportPath = path.join(__dirname, 'INTEGRATION_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }

  async run() {
    try {
      this.checkFileStructure();
      this.checkEnvironment();
      this.checkDependencies();
      this.checkCodeQuality();
      this.checkAPIEndpoints();
      this.checkFrontendIntegration();
      await this.checkDatabase();

      this.generateSummary();
      this.printReport();
      this.saveReport();

      process.exit(0);
    } catch (error) {
      console.error('Report generation error:', error);
      process.exit(1);
    }
  }
}

const report = new IntegrationReport();
report.run();
