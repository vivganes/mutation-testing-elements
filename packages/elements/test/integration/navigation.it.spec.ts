import { ReportPage } from './po/ReportPage.js';
import { expect } from 'chai';
import { test, expect as expectPW } from '@playwright/test';
import type { NavTab } from './po/NavTab.po.js';

test.describe('Navigation', () => {
  let page: ReportPage;

  test.beforeEach(({ page: p }) => {
    page = new ReportPage(p);
  });

  test.describe('when starting at the index page', () => {
    test.beforeEach(() => {
      return page.navigateTo('scala-example/');
    });
    test('should show "all files"', async () => {
      expect(await page.title()).eq('All files - Stryker report');
    });
    test("shouldn't show the navigation tabs if there are no test details", async () => {
      const tabs = await page.navigationTabs();
      expect(tabs).lengthOf(0);
    });

    test.describe('-> "config"', () => {
      test.beforeEach(async () => {
        await page.mutantView.resultTable().row('config').navigate();
      });

      test('should show "config" page', async () => {
        const title = await page.title();
        expect(title).eq('config - Stryker report');
      });

      test('should show breadcrumb "All files - config"', async () => {
        await expectPW(page.breadcrumb().items()).toHaveText(['All files', 'config']);
      });

      test('should show "Config.Scala" after navigating to Config.scala', async () => {
        await page.mutantView.resultTable().row('Config.scala').navigate();
        await expectPW(page.breadcrumb().items()).toHaveText(['All files', 'config', 'Config.scala']);
      });

      test.describe('when navigating to "All files" using the breadcrumb', () => {
        test.beforeEach(() => {
          return page.breadcrumb().navigate('All files');
        });

        test('should show "all files"', async () => {
          expect(await page.title()).eq('All files - Stryker report');
        });
      });
    });
  });

  test.describe('when opening a report with test details', () => {
    let tabs: NavTab[];

    test.beforeEach(async () => {
      await page.navigateTo('lighthouse-example/');
      tabs = await page.navigationTabs();
    });

    test('should show the navigation tabs', async () => {
      const labels = await Promise.all(tabs.map((tab) => tab.text()));
      expect(tabs).lengthOf(2);
      expect(labels).deep.eq(['👽 Mutants', '🧪 Tests']);
    });

    test('should show the mutant view by default', async () => {
      expect(await page.title()).eq('All files');
      expect(page.currentUrl()).contains('#mutant');
      expect(await tabs[0].isActive()).true;
      expect(await tabs[1].isActive()).false;
    });

    test.describe('open tests', () => {
      test.beforeEach(async () => {
        await tabs[1].navigate();
      });

      test('should show the tests view', async () => {
        await expectPW.poll(() => page.title()).toEqual('All tests');
        expect(page.currentUrl()).contains('#test');
        expect(await tabs[0].isActive()).false;
        expect(await tabs[1].isActive()).true;
      });

      test.describe('-> metrics', () => {
        test.beforeEach(async () => {
          await page.testView.resultTable().row('metrics').navigate();
        });

        test('should show "metrics" page', async () => {
          const title = await page.title();
          expect(title).eq('metrics');
        });

        test('should show breadcrumb "All tests - metrics"', async () => {
          await expectPW(page.breadcrumb().items()).toHaveText(['All tests', 'metrics']);
        });

        test('should show "interactive-test.js" after navigating to interactive-test.js', async () => {
          await page.testView.resultTable().row('interactive-test.js').navigate();
          await expectPW(page.breadcrumb().items()).toHaveText(['All tests', 'metrics', 'interactive-test.js']);
        });

        test.describe('when navigating to "All tests" using the breadcrumb', () => {
          test.beforeEach(() => {
            return page.breadcrumb().navigate('All tests');
          });

          test('should show "all tests"', async () => {
            expect(await page.title()).eq('All tests');
          });
        });
      });
    });
  });
});
