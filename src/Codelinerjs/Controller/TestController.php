<?php

/**
 * TestController
 *
 * @author Alexander Miertsch kontakt@codeliner.ws
 * @package Cl
 * @subpackage Mvc
 * @version 1.0
 */
namespace Codelinerjs\Controller;

use Codelinerjs\Javascript\Loader\AbstractLoader;
use Codelinerjs\Javascript\Loader\JsLoaderAwareInterface;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class TestController
    extends AbstractActionController
    implements JsLoaderAwareInterface
{
    /**
     *
     * @var AbstractLoader
     */
    protected $jsLoader;

    protected $testCaseLoader;

    protected $qunitEnabled = false;

    public function setJsLoader(AbstractLoader $jsLoader)
    {
        $this->jsLoader = $jsLoader;
    }

    public function setTestCaseLoader($testCaseLoader)
    {
        $this->testCaseLoader = $testCaseLoader;
    }

    public function setQunitEnabled($qunitEnabled)
    {
        $this->qunitEnabled = $qunitEnabled;
    }

    public function indexAction()
    {
        
        if ($this->isQunitEnabled()) {
            $this->getEvent()->setParam("head_link", '/ajax/');
            $this->jsLoader->reset();
            $this->jsLoader->addIncludePath("Jstest", $this->testCaseLoader->getPath());
            $this->jsLoader->setPreInitLoadStack(array("Cl.Qunit.Qunit"));            
            $this->jsLoader->appendPreInitLoadStack($this->testCaseLoader->getTestcases());

            return $this->getViewModel();
        }
    }

    protected function getViewModel()
    {
        $this->getServiceLocator()
                ->get('viewhelpermanager')
                ->get("headLink")
                ->appendStylesheet('/'
                .  $this->getServiceLocator()->get('css_manager')->getPublicFolder()
                . '/qunit.css');

        $view = new ViewModel();
        $view->setTemplate("jsloader/jstest/qunit.phtml");
        $view->setTerminal(TRUE);
        return $view;
    }

    protected function isQunitEnabled()
    {
        return $this->qunitEnabled;
    }
}