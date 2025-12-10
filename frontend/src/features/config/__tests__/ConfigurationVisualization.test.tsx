import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import configReducer from '../configSlice';
import ConfigTreeViewer from '../components/ConfigTreeViewer';
import YamlEditor from '../components/YamlEditor';
import FileBrowser from '../components/FileBrowser';
import TemplateSystem from '../components/TemplateSystem';
import ValidationSystem from '../components/ValidationSystem';
import ConfigDiffTool from '../components/ConfigDiffTool';

// Mock the Redux store
const mockStore = configureStore({
  reducer: {
    config: configReducer
  },
  preloadedState: {
    config: {
      configStructure: {
        libraries: {
          Movies: {
            type: 'movie',
            collections: ['Action', 'Comedy'],
            overlays: ['Resolution', 'Audio']
          }
        },
        settings: {
          global: {
            timeout: 180,
            verify_ssl: true
          }
        }
      },
      files: {
        config_files: [
          { path: 'config/config.yml', type: 'file', full_path: '/config/config.yml' }
        ],
        defaults_files: [
          { path: 'defaults/collections.yml', type: 'file', full_path: '/defaults/collections.yml' }
        ],
        total_files: 2
      },
      fileContent: {
        data: {
          path: 'config/config.yml',
          type: 'file',
          content: 'name: Test Config\ntype: collection',
          resolved_path: '/config/config.yml'
        }
      },
      validation: {
        data: {
          valid: true,
          errors: [],
          warnings: ['Consider adding a description'],
          structure: {
            has_libraries: true,
            library_count: 1,
            has_playlists: false,
            has_settings: true
          }
        }
      },
      loading: false,
      error: null
    }
  }
});

describe('Configuration Visualization Components - End-to-End Tests', () => {
  // Test ConfigTreeViewer
  describe('ConfigTreeViewer', () => {
    it('should render configuration structure correctly', () => {
      render(
        <Provider store={mockStore}>
          <ConfigTreeViewer />
        </Provider>
      );

      expect(screen.getByText('Configuration Structure')).toBeInTheDocument();
      expect(screen.getByText('Libraries')).toBeInTheDocument();
      expect(screen.getByText('Movies')).toBeInTheDocument();
      expect(screen.getByText('Collections')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Comedy')).toBeInTheDocument();
    });

    it('should expand and collapse tree nodes', () => {
      render(
        <Provider store={mockStore}>
          <ConfigTreeViewer />
        </Provider>
      );

      // Click on expand/collapse buttons
      const expandButtons = screen.getAllByRole('button', { name: /expand/i });
      fireEvent.click(expandButtons[0]);

      // Verify expansion
      expect(screen.getByText('Collections')).toBeInTheDocument();
    });
  });

  // Test YamlEditor
  describe('YamlEditor', () => {
    it('should render YAML editor with content', () => {
      render(
        <Provider store={mockStore}>
          <YamlEditor />
        </Provider>
      );

      expect(screen.getByText('YAML Configuration Editor')).toBeInTheDocument();
      expect(screen.getByText('Configuration Content')).toBeInTheDocument();
    });

    it('should show validation results', () => {
      render(
        <Provider store={mockStore}>
          <YamlEditor />
        </Provider>
      );

      expect(screen.getByText('Validation Results')).toBeInTheDocument();
      expect(screen.getByText('Consider adding a description')).toBeInTheDocument();
    });
  });

  // Test FileBrowser
  describe('FileBrowser', () => {
    it('should render file browser with files', () => {
      render(
        <Provider store={mockStore}>
          <FileBrowser />
        </Provider>
      );

      expect(screen.getByText('Configuration File Browser')).toBeInTheDocument();
      expect(screen.getByText('Configuration Files')).toBeInTheDocument();
      expect(screen.getByText('config.yml')).toBeInTheDocument();
      expect(screen.getByText('defaults/collections.yml')).toBeInTheDocument();
    });

    it('should show file content dialog when file is clicked', () => {
      render(
        <Provider store={mockStore}>
          <FileBrowser />
        </Provider>
      );

      // Click on a file to view content
      const fileButtons = screen.getAllByRole('button', { name: /view content/i });
      fireEvent.click(fileButtons[0]);

      // Verify dialog appears
      expect(screen.getByText('File Information')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  // Test TemplateSystem
  describe('TemplateSystem', () => {
    it('should render template system with tabs', () => {
      render(
        <Provider store={mockStore}>
          <TemplateSystem />
        </Provider>
      );

      expect(screen.getByText('Template System')).toBeInTheDocument();
      expect(screen.getByText('Template Library')).toBeInTheDocument();
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });

    it('should switch between tabs', () => {
      render(
        <Provider store={mockStore}>
          <TemplateSystem />
        </Provider>
      );

      // Click on Create Template tab
      const createTab = screen.getByRole('tab', { name: 'Create Template' });
      fireEvent.click(createTab);

      expect(screen.getByText('Template Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  // Test ValidationSystem
  describe('ValidationSystem', () => {
    it('should render validation system with tabs', () => {
      render(
        <Provider store={mockStore}>
          <ValidationSystem />
        </Provider>
      );

      expect(screen.getByText('Configuration Validation System')).toBeInTheDocument();
      expect(screen.getByText('YAML Validation')).toBeInTheDocument();
      expect(screen.getByText('Reference Validation')).toBeInTheDocument();
    });

    it('should show validation results', () => {
      render(
        <Provider store={mockStore}>
          <ValidationSystem />
        </Provider>
      );

      // Click validate button (mock behavior)
      const validateButton = screen.getByRole('button', { name: /validate yaml/i });
      fireEvent.click(validateButton);

      // Verify validation results appear
      expect(screen.getByText('Validation Results')).toBeInTheDocument();
      expect(screen.getByText('Consider adding a description')).toBeInTheDocument();
    });
  });

  // Test ConfigDiffTool
  describe('ConfigDiffTool', () => {
    it('should render diff tool with tabs', () => {
      render(
        <Provider store={mockStore}>
          <ConfigDiffTool />
        </Provider>
      );

      expect(screen.getByText('Configuration Diff Tool')).toBeInTheDocument();
      expect(screen.getByText('Side-by-Side Comparison')).toBeInTheDocument();
      expect(screen.getByText('Inline Diff')).toBeInTheDocument();
    });

    it('should load sample templates', () => {
      render(
        <Provider store={mockStore}>
          <ConfigDiffTool />
        </Provider>
      );

      // Click load sample button
      const loadButton = screen.getByRole('button', { name: /basic sample/i });
      fireEvent.click(loadButton);

      // Verify sample is loaded
      expect(screen.getByText('Loaded basic sample to original')).toBeInTheDocument();
    });
  });
});

// Integration test for the entire configuration visualization flow
describe('Configuration Visualization Integration Tests', () => {
  it('should allow user to view, edit, validate, and compare configurations', async () => {
    // Render the main configuration page (simulated)
    render(
      <Provider store={mockStore}>
        <div>
          <ConfigTreeViewer />
          <YamlEditor />
          <FileBrowser />
          <ValidationSystem />
          <ConfigDiffTool />
        </div>
      </Provider>
    );

    // 1. User views configuration structure
    expect(screen.getByText('Configuration Structure')).toBeInTheDocument();

    // 2. User browses files
    expect(screen.getByText('Configuration File Browser')).toBeInTheDocument();

    // 3. User views file content
    const fileButtons = screen.getAllByRole('button', { name: /view content/i });
    fireEvent.click(fileButtons[0]);

    // 4. User edits configuration
    expect(screen.getByText('YAML Configuration Editor')).toBeInTheDocument();

    // 5. User validates configuration
    const validateButton = screen.getByRole('button', { name: /validate yaml/i });
    fireEvent.click(validateButton);

    // 6. User compares configurations
    const loadButton = screen.getByRole('button', { name: /basic sample/i });
    fireEvent.click(loadButton);

    // Verify all components work together
    expect(screen.getByText('Validation Results')).toBeInTheDocument();
    expect(screen.getByText('Loaded basic sample to original')).toBeInTheDocument();
  });
});

// Performance test
describe('Configuration Visualization Performance Tests', () => {
  it('should handle large configuration files efficiently', () => {
    // Create a mock store with large configuration
    const largeConfigStore = configureStore({
      reducer: {
        config: configReducer
      },
      preloadedState: {
        config: {
          ...mockStore.getState().config,
          configStructure: {
            libraries: {
              ...Array(50).fill(0).reduce((acc, _, i) => ({
                ...acc,
                [`Library${i}`]: {
                  type: 'movie',
                  collections: Array(10).fill(0).map((_, j) => `Collection${j}`),
                  overlays: Array(5).fill(0).map((_, k) => `Overlay${k}`)
                }
              }), {})
            }
          }
        }
      }
    });

    // Render with large configuration
    const { container } = render(
      <Provider store={largeConfigStore}>
        <ConfigTreeViewer />
      </Provider>
    );

    // Verify it renders without crashing
    expect(container).toBeInTheDocument();
    expect(screen.getByText('Configuration Structure')).toBeInTheDocument();
  });
});

// Accessibility test
describe('Configuration Visualization Accessibility Tests', () => {
  it('should have proper accessibility attributes', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <ConfigTreeViewer />
      </Provider>
    );

    // Check for accessibility attributes
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem')).toHaveLength(5); // Libraries + Settings + their children
    expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
  });
});