import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginComponent } from './login';
import { CURRENT_USER_REPOSITORY, INIT_APP_REPOSITORY } from '../../tokens/repository.tokens';
import { ERROR_MESSAGES, STORAGE_KEYS } from '../../constants/general.constants';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockInitRepo: jasmine.SpyObj<any>;
  let mockCurrentUserRepo: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockInitRepo = jasmine.createSpyObj('InitAppRepository', ['initializeDatabase']);
    mockCurrentUserRepo = jasmine.createSpyObj('CurrentUserRepository', ['exists']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: INIT_APP_REPOSITORY, useValue: mockInitRepo },
        { provide: CURRENT_USER_REPOSITORY, useValue: mockCurrentUserRepo },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Inicialización del componente', () => {
    it('debería crear el componente', () => {
      // Arrange - ya configurado en beforeEach

      // Act - componente ya creado

      // Assert
      expect(component).toBeTruthy();
    });

    it('debería inicializar registration como string vacío', () => {
      // Arrange - ya configurado en beforeEach

      // Act - componente ya creado

      // Assert
      expect(component.registration).toBe('');
    });

    it('debería inicializar email como string vacío', () => {
      // Arrange - ya configurado en beforeEach

      // Act - componente ya creado

      // Assert
      expect(component.email).toBe('');
    });

    it('debería inicializar errorMessage como string vacío', () => {
      // Arrange - ya configurado en beforeEach

      // Act - componente ya creado

      // Assert
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Validación de campos vacíos', () => {
    it('debería mostrar error cuando registration está vacío', async () => {
      // Arrange
      component.registration = '';
      component.email = 'test@test.com';

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_VALIDATION_FAILED);
    });

    it('debería mostrar error cuando email está vacío', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = '';

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_VALIDATION_FAILED);
    });

    it('debería mostrar error cuando ambos campos están vacíos', async () => {
      // Arrange
      component.registration = '';
      component.email = '';

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_VALIDATION_FAILED);
    });

    it('debería mostrar error cuando registration tiene solo espacios', async () => {
      // Arrange
      component.registration = '   ';
      component.email = 'test@test.com';

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_VALIDATION_FAILED);
    });

    it('debería mostrar error cuando email tiene solo espacios', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = '   ';

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_VALIDATION_FAILED);
    });

    it('no debería llamar a initializeDatabase cuando la validación falla', async () => {
      // Arrange
      component.registration = '';
      component.email = '';

      // Act
      await component.save();

      // Assert
      expect(mockInitRepo.initializeDatabase).not.toHaveBeenCalled();
    });
  });

  describe('Almacenamiento en localStorage', () => {
    it('debería guardar registration en localStorage', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.CURRENT_REGISTRATION)).toBe('T10541');
    });

    it('debería guardar email en localStorage', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.CURRENT_EMAIL)).toBe('test@test.com');
    });

    it('debería guardar registration sin espacios en los extremos', async () => {
      // Arrange
      component.registration = '  T10541  ';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.CURRENT_REGISTRATION)).toBe('T10541');
    });

    it('debería guardar email sin espacios en los extremos', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = '  test@test.com  ';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.CURRENT_EMAIL)).toBe('test@test.com');
    });
  });

  describe('Inicialización de base de datos', () => {
    it('debería llamar a initializeDatabase con el registration', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(mockInitRepo.initializeDatabase).toHaveBeenCalledWith('T10541');
    });

    it('debería llamar a exists después de initializeDatabase', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(mockCurrentUserRepo.exists).toHaveBeenCalledWith('T10541');
    });
  });

  describe('Navegación cuando el usuario NO existe', () => {
    it('debería navegar a /init cuando el usuario no existe', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(false));

      // Act
      await component.save();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('no debería navegar a / cuando el usuario no existe', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(false));

      // Act
      await component.save();

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/']);
    });
  });

  describe('Navegación cuando el usuario SÍ existe', () => {
    it('debería navegar a / cuando el usuario existe', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('no debería navegar a /init cuando el usuario existe', async () => {
      // Arrange
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/init']);
    });
  });

  describe('Manejo de errores', () => {
    it('debería mostrar mensaje de error cuando initializeDatabase falla', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.reject(error));

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.DB_INIT_FAILED(error));
    });

    it('debería mostrar mensaje de error cuando exists falla', async () => {
      // Arrange
      const error = new Error('Query failed');
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.reject(error));

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe(ERROR_MESSAGES.DB_INIT_FAILED(error));
    });

    it('no debería navegar cuando ocurre un error', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.reject(error));

      // Act
      await component.save();

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('debería limpiar errorMessage al iniciar save()', async () => {
      // Arrange
      component.errorMessage = 'Error previo';
      component.registration = 'T10541';
      component.email = 'test@test.com';
      mockInitRepo.initializeDatabase.and.returnValue(Promise.resolve());
      mockCurrentUserRepo.exists.and.returnValue(Promise.resolve(true));

      // Act
      await component.save();

      // Assert
      expect(component.errorMessage).toBe('');
    });
  });
});
