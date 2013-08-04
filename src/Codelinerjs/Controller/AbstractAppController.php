<?php

/**
 * AppController
 *
 * @author Alexander Miertsch kontakt@codeliner.ws
 * @package Cl
 * @subpackage Mvc
 * @version 1.0
 */
namespace Codelinerjs\Controller;

use Codelinerjs\Javascript\Loader;
use Codelinerjs\Javascript\Loader\JsLoaderAwareInterface;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Controller\AbstractActionController;
//@todo umbauen zu Interface, module hängt listener in Mvc Dispatch, der dann die Arbeit übernimmt
class AbstractAppController
    extends AbstractActionController
    implements JsLoaderAwareInterface
{

    protected $checkForJsController = true;
    /**
     *
     * @var JsLoader
     */
    protected $jsLoader;


    protected function disableCheckForJsController () {
        $this->checkForJsController = false;
    }

    /**
     * Register the default events for this controller
     *
     * @return void
     */
    protected function attachDefaultListeners()
    {
        parent::attachDefaultListeners();
        $events = $this->getEventManager();
        $events->attach('dispatch', array($this, 'initJsController'), -10);
        $events->attach('dispatch', array($this->getJsLoader(), 'onMvcDispatch'), -90);
    }

    /**
     *
     * @return JsLoader
     *
     * @throws Exception\UnexpectedValueException
     */
    public function getJsLoader () {
        return $this->jsLoader;
    }

    public function setJsLoader(Loader\AbstractLoader $jsLoader) {
        $this->jsLoader = $jsLoader;
    }

    public function initJsController (MvcEvent $e) {
        if ($this->checkForJsController) {
            if ($routeMatch = $e->getRouteMatch()) {
                $controllerName = $routeMatch->getParam('controller');

                $controllerName = str_replace('\\', '.', $controllerName);

                $this->getJsLoader()->appendPreInitLoadStack(array($controllerName));
                $this->getJsLoader()->appendPostInitLoadStack(array(
                    'controller' => $controllerName
                ));

                 $this->getJsLoader()->addUserVars(array(
                    '$ACTION' => $routeMatch->getParam('action', 'index')
                ));
            }
        }
    }
}
