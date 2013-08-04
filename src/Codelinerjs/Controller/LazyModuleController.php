<?php
namespace Codelinerjs\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Codelinerjs\Javascript\Loader\JsLoaderAwareInterface;
use Codelinerjs\Javascript\Loader\AbstractLoader;
/**
 * Description of LazyModuleController
 *
 * @author Alexander Miertsch <kontakt@codeliner.ws>
 * @copyright (c) 2013, Alexander Miertsch
 */
class LazyModuleController extends AbstractActionController implements JsLoaderAwareInterface
{
    /**
     *
     * @var AbstractLoader
     */
    protected $jsLoader;

    public function setJsLoader(AbstractLoader $jsLoader)
    {
        $this->jsLoader = $jsLoader;
    }

    public function loadModuleAction()
    {
        $moduleName = $this->getEvent()->getRouteMatch()->getParam('jsmodule');
        $jsLoaderInstance = $this->getEvent()->getRouteMatch()->getParam('jsloader', 'default');

        $config = $this->getServiceLocator()->get('configuration');

        $moduleConfig = $config['codelinerjs.js_loader'][$jsLoaderInstance]['lazy_modules'][$moduleName];

        $scriptSrc = $this->jsLoader->loadModule($moduleName, $moduleConfig);

        return $this->getResponse()->setContent($scriptSrc);
    }
}