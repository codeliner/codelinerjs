<?php
namespace Codelinerjs;

return array(
    'router' => array(
        'routes' => array(
            'jstest_all' => array(
                'type' => 'Zend\Mvc\Router\Http\Literal',
                'options' => array(
                    'route'    => '/codelinerjs/jstest',
                    'defaults' => array(
                        'controller' => 'Codelinerjs\Controller\Test',
                        'action'     => 'index',
                    ),
                ),
            ),
            'jsloader_load_module' => array(
                'type' => 'Zend\Mvc\Router\Http\Segment',
                'options' => array(
                    'route' => '/codelinerjs/load-module/:jsmodule[/:jsloader]',
                    'constraints' => array(
                        'jsmodule' => '[a-zA-Z0-9_]+',
                        'jsloader' => '[a-zA-Z0-9_]+',
                    ),
                    'defaults' => array(
                        'controller' => 'Codelinerjs\Controller\LazyModule',
                        'action' => 'loadModule',
                        'jsloader' => 'default',
                    ),
                ),
            ),
        ),
    ),
    'service_manager' => array(
        'factories' => array(
            'codelinerjs.js_loader' => 'Codelinerjs\Javascript\JsLoaderServiceFactory',
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'Codelinerjs\Controller\LazyModule' => 'Codelinerjs\Controller\LazyModuleController',
        ),
        'factories' => array(
            'Codelinerjs\Controller\Test' => function($cl) {
                $config = $cl->getServiceLocator()->get("Configuration");

                $c = new Controller\TestController();
                
                $tl = new Javascript\Loader\TestcaseLoader();
                $tl->setPath($config['codelinerjs.jstest_loader']['test_path']);

                $c->setTestCaseLoader($tl);

                if (isset($config['codelinerjs.jstest_loader']['qunit_enabled'])) {
                    $c->setQunitEnabled($config['codelinerjs.jstest_loader']['qunit_enabled']);
                }

                return $c;
            },
        )
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
    ),
    'css_manager' => array(
        'files' => array(
            'qunit.css' => __DIR__ . '/../src/Codelinerjs/Javascript/library/Qunit/Qunit.css',
        ),
    ),
    "codelinerjs.js_loader" => array(
        'default' => array(
            'public_path' => __DIR__ . '/../../../public/js',
            'public_link' => '/js',
        ),
    ),
    "codelinerjs.jstest_loader" => array(
        'test_path' => __DIR__ . '/../../../tests/Qunit',
    ),
);
