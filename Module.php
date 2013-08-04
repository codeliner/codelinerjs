<?php
/**
 * Jsloader Module
 *
 * @author Alexander Miertsch kontakt@codeliner.ws
 * @package Jsloader
 * @copyright 2012 Fenske und Miertsch GbR
 */
namespace Codelinerjs;

use Codelinerjs\Javascript\Loader\JsLoaderAwareInterface;

class Module
{
    public function onBootstrap($e)
    {
        $serviceManager = $e->getApplication()->getServiceManager();
        $jsLoader = $serviceManager->get('codelinerjs.js_loader');
        $controllers = $serviceManager->get('ControllerLoader');
        $controllers->addInitializer(function ($instance) use ($jsLoader) {
            if ($instance instanceof JsLoaderAwareInterface) {
                $instance->setJsLoader($jsLoader);
            }
        });
    }

    public function getConfig()
    {
        return include __DIR__ . '/config/module.config.php';
    }

    public function getAutoloaderConfig()
    {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }

    public function getViewHelperConfig()
    {
        return array(
            'factories' => array(
                'codelinerjsLoader' => function ($serviceLocator) {
                    $jsLoaderHelper = new \Codelinerjs\View\Helper\Jsloader();
                    $jsLoaderHelper->setServiceManager($serviceLocator->getServiceLocator());
                    return $jsLoaderHelper;
                },
            )
        );
    }
}
